import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { guardAdmin } from "@/lib/auth";
import { getStore, uploadsEnabled } from "@/lib/storage";
import { CONTENT_KEYS, sanitizeContentPart } from "@/lib/validate";
import type { ContentKey } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const store = await getStore();
  try {
    const content = await store.getContent();
    return Response.json({
      content,
      storage: { kind: store.kind, writable: store.writable, uploads: uploadsEnabled() },
    });
  } catch (err) {
    console.error("content load failed", err);
    return Response.json({ error: "Couldn't load content from storage." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const store = await getStore();
  if (!store.writable) {
    return Response.json({ error: "Storage not connected yet — changes won't be saved." }, { status: 409 });
  }
  let body: { key?: string; value?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const key = body.key as ContentKey;
  if (!CONTENT_KEYS.includes(key)) return Response.json({ error: "Unknown section." }, { status: 400 });

  try {
    const content = await store.getContent();
    const value = sanitizeContentPart(key, body.value);
    const next = { ...content, [key]: value, updatedAt: new Date().toISOString() };
    await store.saveContent(next);
    revalidatePath("/", "layout");
    return Response.json({ ok: true, value, updatedAt: next.updatedAt });
  } catch (err) {
    console.error("content save failed", err);
    return Response.json({ error: "Couldn't save. Please try again." }, { status: 500 });
  }
}
