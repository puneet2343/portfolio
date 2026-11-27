import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getStore } from "@/lib/storage";

const BOT_RE = /bot|crawl|spider|slurp|preview|lighthouse|headless|curl|wget|python|monitor/i;

/** Privacy-friendly page-view counter: sets no cookies, stores no IPs or user agents, only path + day counts. */
export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT_RE.test(ua)) return new Response(null, { status: 204 });
  if (verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)) return new Response(null, { status: 204 });

  let path = "/";
  try {
    const body = JSON.parse(await req.text()) as { path?: unknown };
    if (typeof body.path === "string") path = body.path;
  } catch {
    return new Response(null, { status: 204 });
  }
  path = path.split("?")[0].split("#")[0].slice(0, 120);
  if (!/^\/[a-z0-9\-/]*$/i.test(path) || path.startsWith("/admin") || path.startsWith("/api")) {
    return new Response(null, { status: 204 });
  }
  try {
    await (await getStore()).recordView(path);
  } catch {
    /* analytics must never break the page */
  }
  return new Response(null, { status: 204 });
}
