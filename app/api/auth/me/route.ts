import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth/session";
export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ user: null }, { status: 200, headers: { "Cache-Control": "no-store" } });
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, fullName: true, role: true, countryCode: true, isActive: true }
    });
    if (!user || !user.isActive) return NextResponse.json({ user: null }, { status: 200, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Le service est temporairement indisponible." }, { status: 503 });
  }
}
