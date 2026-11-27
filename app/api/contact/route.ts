import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { clientKey, sameOrigin } from "@/lib/auth";
import { getStore } from "@/lib/storage";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return Response.json({ error: "Bad origin." }, { status: 403 });
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const str = (k: string, max: number) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");

  // Honeypot: people never see or fill this field. Pretend success so bots move on.
  if (str("website", 200)) return Response.json({ ok: true });
  // Time trap: the form must have been open for at least 3 seconds.
  const startedAt = Number(body.t);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 3000) return Response.json({ ok: true });

  const name = str("name", 120);
  const email = str("email", 200);
  const subject = str("subject", 200);
  const message = str("message", 5000);
  if (name.length < 2) return Response.json({ error: "Please enter your name." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return Response.json({ error: "Please enter a valid email." }, { status: 400 });
  if (message.length < 10) return Response.json({ error: "Message is a bit short (10+ characters)." }, { status: 400 });

  const store = await getStore();
  if (!store.writable) {
    return Response.json({ error: "The message box isn't connected yet. Please email me directly." }, { status: 503 });
  }
  try {
    const hits = await store.hit(`contact:${clientKey(req)}`, WINDOW_MS);
    if (hits > MAX_PER_WINDOW) {
      return Response.json({ error: "Too many messages. Please try again later or email me." }, { status: 429 });
    }
    await store.addMessage({
      id: randomUUID(),
      name,
      email,
      subject,
      body: message,
      createdAt: new Date().toISOString(),
      read: false,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("contact save failed", err);
    return Response.json({ error: "Couldn't send right now. Please email me instead." }, { status: 500 });
  }
}
