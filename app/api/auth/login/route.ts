import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { applySessionCookie, createSessionToken } from "@/lib/auth/session";

export const runtime = "nodejs";
const schema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(72) });

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "E-mail ou mot de passe incorrect." }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    const valid = user && user.isActive && await compare(parsed.data.password, user.passwordHash);
    if (!valid || !user) return NextResponse.json({ error: "E-mail ou mot de passe incorrect." }, { status: 401 });
    const token = await createSessionToken(user.id, user.role);
    const safeUser = { id: user.id, email: user.email, fullName: user.fullName, role: user.role, countryCode: user.countryCode };
    return applySessionCookie(NextResponse.json({ user: safeUser }), token);
  } catch {
    return NextResponse.json({ error: "Le service est temporairement indisponible." }, { status: 503 });
  }
}
