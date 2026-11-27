import type { NextRequest } from "next/server";
import { guardAdmin } from "@/lib/auth";
import { getStore, ReadOnlyError } from "@/lib/storage";

function fail(err: unknown) {
  if (err instanceof ReadOnlyError) return Response.json({ error: err.message }, { status: 409 });
  console.error(err);
  return Response.json({ error: "Something went wrong." }, { status: 500 });
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/admin/messages/[id]">) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  let read = true;
  try {
    read = (await req.json()).read !== false;
  } catch {
    /* default: mark read */
  }
  try {
    const ok = await (await getStore()).setMessageRead(id, read);
    return ok ? Response.json({ ok: true }) : Response.json({ error: "Not found." }, { status: 404 });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/admin/messages/[id]">) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const ok = await (await getStore()).deleteMessage(id);
    return ok ? Response.json({ ok: true }) : Response.json({ error: "Not found." }, { status: 404 });
  } catch (err) {
    return fail(err);
  }
}
