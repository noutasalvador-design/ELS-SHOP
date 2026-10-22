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
  // Validate session configuration before creating the user, otherwise a missing secret
  // could create an account but fail to issue its session cookie.
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret || authSecret.length < 32) {
    console.error("[auth/register] AUTH_SECRET is missing or too short.");
    return NextResponse.json({ error: "La configuration de sécurité du site est incomplète. Réessayez plus tard." }, { status: 503 });
  }

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
      return NextResponse.json({ error: "Cette adresse e-mail possède déjà un compte. Connectez-vous ou utilisez une autre adresse." }, { status: 409 });
    }
    // Log only a Prisma/error code, never credentials, request bodies, or connection strings.
    const errorCode = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "UNKNOWN";
    console.error("[auth/register] Registration failed:", errorCode);
    return NextResponse.json({ error: "Le service est temporairement indisponible. Vérifiez la configuration du site ou réessayez plus tard." }, { status: 503 });
  }
}
