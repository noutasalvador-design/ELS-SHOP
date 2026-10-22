import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  title: z.string().trim().min(3).max(140),
  slug: z.string().trim().toLowerCase().min(3).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(10).max(5000),
  type: z.enum(["PHYSICAL", "DIGITAL"]),
  priceMinor: z.number().int().positive().max(2_000_000_000),
  stockQuantity: z.number().int().min(0).max(1_000_000).optional(),
  imageUrls: z.array(z.string().url().refine(url => url.startsWith("https://"))).max(5).default([])
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const countryCode = url.searchParams.get("country")?.toUpperCase();
  const type = url.searchParams.get("type");
  const q = url.searchParams.get("q")?.trim().slice(0, 100);
  const page = Math.max(1, Math.min(1000, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1));
  const take = 24;
  if (type && type !== "PHYSICAL" && type !== "DIGITAL") return NextResponse.json({ error: "Type de produit invalide." }, { status: 400 });
  if (countryCode && !/^[A-Z]{2}$/.test(countryCode)) return NextResponse.json({ error: "Code pays invalide." }, { status: 400 });

  try {
    const where = {
      status: "ACTIVE" as const,
      store: { is: { isActive: true } },
      ...(countryCode ? { countryCode } : {}),
      ...(type ? { type: type as "PHYSICAL" | "DIGITAL" } : {}),
      ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { description: { contains: q, mode: "insensitive" as const } }] } : {})
    };
    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take,
        select: {
          id: true, title: true, slug: true, description: true, type: true, priceMinor: true,
          currency: true, countryCode: true, imageUrls: true, createdAt: true,
          store: { select: { name: true, slug: true, countryCode: true, isVerified: true } }
        }
      }),
      prisma.product.count({ where })
    ]);
    return NextResponse.json({ items, page, pageSize: take, total }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } });
  } catch {
    return NextResponse.json({ error: "Le catalogue est temporairement indisponible." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (session.role !== "SELLER") return NextResponse.json({ error: "Créez une boutique vendeur avant de publier un produit." }, { status: 403 });

  const raw = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Vérifiez les informations du produit." }, { status: 400 });
  const data = parsed.data;

  try {
    const store = await prisma.store.findFirst({ where: { ownerId: session.userId, isActive: true }, select: { id: true, countryCode: true, currency: true } });
    if (!store) return NextResponse.json({ error: "Aucune boutique active n'est associée à ce compte." }, { status: 403 });
    if (data.type === "PHYSICAL" && data.stockQuantity === undefined) {
      return NextResponse.json({ error: "Indiquez le stock disponible pour un produit physique." }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: {
        storeId: store.id, title: data.title, slug: data.slug, description: data.description,
        type: data.type, priceMinor: data.priceMinor, currency: store.currency,
        countryCode: store.countryCode, stockQuantity: data.type === "PHYSICAL" ? data.stockQuantity : null,
        imageUrls: data.imageUrls, status: "DRAFT"
      },
      select: { id: true, title: true, slug: true, type: true, status: true, priceMinor: true, currency: true, countryCode: true }
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Ce slug existe déjà dans votre boutique." }, { status: 409 });
    }
    return NextResponse.json({ error: "Le produit n'a pas pu être enregistré." }, { status: 503 });
  }
}
