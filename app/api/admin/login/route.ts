import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  authConfigured,
  checkCredentials,
  clientKey,
  createSessionToken,
  sameOrigin,
  sessionCookieOptions,
} from "@/lib/auth";
import { getStore } from "@/lib/storage";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return Response.json({ error: "Bad origin." }, { status: 403 });
  if (!authConfigured()) {
    return Response.json({ error: "Admin login isn't configured on this server." }, { status: 503 });
  }
  const store = await getStore();
  const key = `login:${clientKey(req)}`;
  let failures = 0;
  try {
    failures = await store.peek(key, WINDOW_MS);
  } catch (err) {
    console.error("rate limit store failed", err);
  }
  if (failures >= MAX_ATTEMPTS) {
    return Response.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429, headers: { "Retry-After": "900" } },
    );
  }

  let body: { username?: unknown; password?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body */
  }
  const username = typeof body.username === "string" ? body.username.slice(0, 200) : "";
  const password = typeof body.password === "string" ? body.password.slice(0, 500) : "";

  // Small fixed delay slows down guessing without hurting a real login.
  await new Promise((r) => setTimeout(r, 400));

  if (!checkCredentials(username, password)) {
    let count = failures + 1;
    try {
      count = await store.hit(key, WINDOW_MS);
    } catch {
      /* ignore */
    }
    const left = Math.max(0, MAX_ATTEMPTS - count);
    return Response.json(
      {
        error:
          left > 0
            ? `Wrong username or password. ${left} attempt${left === 1 ? "" : "s"} left.`
            : "Wrong username or password.",
      },
      { status: 401 },
    );
  }

  const res = Response.json({ ok: true });
  const opts = sessionCookieOptions(req);
  const cookie = [
    `${SESSION_COOKIE}=${createSessionToken()}`,
    `Path=${opts.path}`,
    `Max-Age=${opts.maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
    opts.secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
  res.headers.append("Set-Cookie", cookie);
  return res;
}
