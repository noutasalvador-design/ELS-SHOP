import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth/session";
import { isMarketCountryCode, MARKET_COUNTRIES } from "@/lib/market/countries";

export const runtime = "nodejs";
const schema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().toLowerCase().min(3).max(60).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(1000).optional(),
  countryCode: z.string().trim().toUpperCase().refine(isMarketCountryCode, "Pays non encore activé.")
});

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ store: null }, { status: 200, headers: { "Cache-Control": "no-store" } });
  try {
    const store = await prisma.store.findUnique({
      where: { ownerId: session.userId },
      select: { id: true, name: true, slug: true, description: true, countryCode: true, currency: true, isVerified: true, isActive: true, createdAt: true, _count: { select: { products: true } } }
    });
    return NextResponse.json({ store }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "La boutique est temporairement indisponible." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (session.role === "ADMIN") return NextResponse.json({ error: "Un compte administrateur ne peut pas créer une boutique vendeur." }, { status: 403 });

  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Vérifiez le nom, l'adresse et le pays de la boutique." }, { status: 400 });
  const { name, slug, description, countryCode } = parsed.data;
  if (!isMarketCountryCode(countryCode)) return NextResponse.json({ error: "Pays non pris en charge pour le moment." }, { status: 400 });

  try {
    const existing = await prisma.store.findUnique({ where: { ownerId: session.userId }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "Ce compte possède déjà une boutique." }, { status: 409 });
    const store = await prisma.$transaction(async tx => {
      const created = await tx.store.create({
        data: { ownerId: session.userId, name, slug, description, countryCode, currency: MARKET_COUNTRIES[countryCode].currency }
      });
      await tx.user.update({ where: { id: session.userId }, data: { role: "SELLER" } });
      return created;
    });
    return NextResponse.json({ store: { id: store.id, name: store.name, slug: store.slug, countryCode: store.countryCode, currency: store.currency, isVerified: store.isVerified } }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Cette adresse de boutique est déjà utilisée." }, { status: 409 });
    }
    return NextResponse.json({ error: "Le service est temporairement indisponible." }, { status: 503 });
  }
}
