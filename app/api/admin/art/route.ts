import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { guardAdmin } from "@/lib/auth";
import { sortArt } from "@/lib/content";
import { getStore, ReadOnlyError } from "@/lib/storage";
import { sanitizeArtItem } from "@/lib/validate";

export const dynamic = "force-dynamic";

function fail(err: unknown) {
  if (err instanceof ReadOnlyError) return Response.json({ error: err.message }, { status: 409 });
  console.error("art request failed", err);
  return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

/** All art items, hidden ones included. */
export async function GET(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  try {
    const store = await getStore();
    return Response.json({ items: sortArt(await store.listArt()) });
  } catch (err) {
    return fail(err);
  }
}

/** Create a new art item. */
export async function POST(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  let body: { item?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  try {
    const store = await getStore();
    const item = sanitizeArtItem({ ...(body.item as object), id: "" });
    await store.saveArt(item);
    revalidatePath("/", "layout"); // header rows + /art
    return Response.json({ item });
  } catch (err) {
    return fail(err);
  }
}
