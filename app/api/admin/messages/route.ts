import type { NextRequest } from "next/server";
import { guardAdmin } from "@/lib/auth";
import { getStore } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const store = await getStore();
  try {
    return Response.json({ messages: await store.listMessages(), writable: store.writable });
  } catch (err) {
    console.error("messages load failed", err);
    return Response.json({ error: "Couldn't load messages." }, { status: 500 });
  }
}
