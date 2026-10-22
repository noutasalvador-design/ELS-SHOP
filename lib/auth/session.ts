import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "els_shop_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
type Role = "CUSTOMER" | "SELLER" | "ADMIN";
export type Session = { userId: string; role: Role };

function getSecret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must be configured with at least 32 characters.");
  return new TextEncoder().encode(value);
}
export async function createSessionToken(userId: string, role: Role) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("els-shop-marketplace")
    .setAudience("els-shop-users")
    .setSubject(userId)
    .setExpirationTime("7d")
    .sign(getSecret());
}
export async function readSession(): Promise<Session | null> {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: "els-shop-marketplace",
      audience: "els-shop-users",
      algorithms: ["HS256"]
    });
    const userId = payload.sub;
    const role = payload.role;
    if (!userId || (role !== "CUSTOMER" && role !== "SELLER" && role !== "ADMIN")) return null;
    return { userId, role };
  } catch {
    return null;
  }
}
export function applySessionCookie(response: Response, token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`
  );
  return response;
}
export function clearSessionCookie(response: Response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append("Set-Cookie", `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`);
  return response;
}
