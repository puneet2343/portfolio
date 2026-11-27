import type { NextRequest } from "next/server";
import { guardAdmin } from "@/lib/auth";
import { getStore } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const store = await getStore();
  try {
    const [views, messages] = await Promise.all([store.getViews(14), store.listMessages()]);
    return Response.json({
      views,
      messages: { total: messages.length, unread: messages.filter((m) => !m.read).length },
      storage: { kind: store.kind, writable: store.writable },
    });
  } catch (err) {
    console.error("stats failed", err);
    return Response.json({ error: "Couldn't load stats." }, { status: 500 });
  }
}
