import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth/session";

export const runtime = "nodejs";
const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("verify-store"), storeId: z.string().min(1).max(100) }),
  z.object({ action: z.literal("publish-product"), productId: z.string().min(1).max(100) })
]);

async function requireAdmin() {
  const session = await readSession();
  return session?.role === "ADMIN" ? session : null;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
  try {
    const [stores, products] = await prisma.$transaction([
      prisma.store.findMany({
        where: { isVerified: false, isActive: true },
        orderBy: { createdAt: "asc" }, take: 100,
        select: { id: true, name: true, slug: true, countryCode: true, currency: true, createdAt: true, owner: { select: { fullName: true, email: true } } }
      }),
      prisma.product.findMany({
        where: { status: "DRAFT" },
        orderBy: { createdAt: "asc" }, take: 100,
        select: { id: true, title: true, slug: true, type: true, priceMinor: true, currency: true, countryCode: true, stockQuantity: true, digitalAssetKey: true, createdAt: true, store: { select: { id: true, name: true, isVerified: true, isActive: true } } }
      })
    ]);
    return NextResponse.json({ stores, products }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "La file de modération est temporairement indisponible." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
  const raw = await request.json().catch(() => null);
  const parsed = actionSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Action de modération invalide." }, { status: 400 });

  try {
    if (parsed.data.action === "verify-store") {
      const store = await prisma.store.update({
        where: { id: parsed.data.storeId },
        data: { isVerified: true },
        select: { id: true, name: true, isVerified: true }
      });
      return NextResponse.json({ success: true, store });
    }

    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
      select: { id: true, type: true, stockQuantity: true, digitalAssetKey: true, store: { select: { isVerified: true, isActive: true } } }
    });
    if (!product) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    if (!product.store.isActive || !product.store.isVerified) return NextResponse.json({ error: "Vérifiez d’abord la boutique associée." }, { status: 409 });
    if (product.type === "PHYSICAL" && (!product.stockQuantity || product.stockQuantity < 1)) return NextResponse.json({ error: "Le stock doit être supérieur à zéro pour publier ce produit." }, { status: 409 });
    if (product.type === "DIGITAL" && !product.digitalAssetKey) return NextResponse.json({ error: "Ajoutez et sécurisez le fichier numérique avant de publier ce produit." }, { status: 409 });

    const updated = await prisma.product.update({
      where: { id: product.id }, data: { status: "ACTIVE" },
      select: { id: true, title: true, status: true }
    });
    return NextResponse.json({ success: true, product: updated });
  } catch {
    return NextResponse.json({ error: "La modération n’a pas pu être terminée." }, { status: 503 });
  }
}
