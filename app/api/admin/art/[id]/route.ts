import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { guardAdmin } from "@/lib/auth";
import { getStore, ReadOnlyError } from "@/lib/storage";
import { sanitizeArtItem } from "@/lib/validate";

function fail(err: unknown) {
  if (err instanceof ReadOnlyError) return Response.json({ error: err.message }, { status: 409 });
  console.error("art request failed", err);
  return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

/** Update one art item (full item in the body). */
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/admin/art/[id]">) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  let body: { item?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  try {
    const store = await getStore();
    const prev = await store.getArt(id);
    if (!prev) return Response.json({ error: "Not found." }, { status: 404 });
    const item = sanitizeArtItem({ ...prev, ...(body.item as object), id }, prev);
    await store.saveArt(item);
    revalidatePath("/art");
    return Response.json({ item });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/admin/art/[id]">) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const ok = await (await getStore()).deleteArt(id);
    revalidatePath("/art");
    return ok ? Response.json({ ok: true }) : Response.json({ error: "Not found." }, { status: 404 });
  } catch (err) {
    return fail(err);
  }
}
