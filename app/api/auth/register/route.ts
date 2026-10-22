import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { applySessionCookie, createSessionToken } from "@/lib/auth/session";

export const runtime = "nodejs";
const schema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(10).max(72),
  countryCode: z.string().regex(/^[A-Za-z]{2}$/).default("BJ")
});

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Vérifiez les informations saisies. Le mot de passe doit contenir au moins 10 caractères." }, { status: 400 });

  const { fullName, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  const countryCode = parsed.data.countryCode.toUpperCase();
  if (new TextEncoder().encode(password).length > 72) {
    return NextResponse.json({ error: "Le mot de passe est trop long." }, { status: 400 });
  }

  try {
    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash, countryCode, role: "CUSTOMER" },
      select: { id: true, email: true, fullName: true, role: true, countryCode: true }
    });
    const token = await createSessionToken(user.id, user.role);
    return applySessionCookie(NextResponse.json({ user }, { status: 201 }), token);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Impossible de créer ce compte avec ces informations." }, { status: 409 });
    }
    return NextResponse.json({ error: "Le service est temporairement indisponible." }, { status: 503 });
  }
}
