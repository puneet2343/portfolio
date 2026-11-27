import type { NextRequest } from "next/server";
import { SESSION_COOKIE, sameOrigin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return Response.json({ error: "Bad origin." }, { status: 403 });
  const res = Response.json({ ok: true });
  res.headers.append("Set-Cookie", `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
  return res;
}
