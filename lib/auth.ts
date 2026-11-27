import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "ps_admin";
const SESSION_TTL_S = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ characters).");
  return s;
}

export function authConfigured() {
  return Boolean(
    process.env.ADMIN_USERNAME &&
      process.env.ADMIN_PASSWORD &&
      process.env.SESSION_SECRET &&
      process.env.SESSION_SECRET.length >= 32,
  );
}

/** Constant-time comparison of two strings (hash first so lengths always match). */
function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a, "utf8").digest();
  const hb = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(ha, hb);
}

export function checkCredentials(username: string, password: string) {
  if (!authConfigured()) return false;
  // Evaluate both so timing doesn't reveal which part was wrong.
  const u = safeEqual(username.trim().toLowerCase(), (process.env.ADMIN_USERNAME as string).trim().toLowerCase());
  const p = safeEqual(password, process.env.ADMIN_PASSWORD as string);
  return u && p;
}

function sign(data: string) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function createSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({ sub: "admin", exp: Math.floor(Date.now() / 1000) + SESSION_TTL_S }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token || !authConfigured()) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub?: string; exp?: number };
    return data.sub === "admin" && typeof data.exp === "number" && data.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function sessionCookieOptions(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && !local,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_S,
  };
}

/** For Server Components (admin pages). */
export async function isAdmin() {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** For Route Handlers. Returns an error Response when the request is not allowed, otherwise null. */
export function guardAdmin(req: NextRequest): Response | null {
  if (!verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  if (req.method !== "GET" && req.method !== "HEAD" && !sameOrigin(req)) {
    return Response.json({ error: "Bad origin." }, { status: 403 });
  }
  return null;
}

/** Basic CSRF defence: mutating requests must come from this site. */
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin fetches from older browsers / curl; cookie is SameSite=Lax anyway
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export function clientKey(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  // Store only a hash, never the raw IP.
  return createHash("sha256").update(`${ip}|${process.env.SESSION_SECRET ?? ""}`).digest("hex").slice(0, 24);
}
