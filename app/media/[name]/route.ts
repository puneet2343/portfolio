import { promises as fs } from "node:fs";
import path from "node:path";
import type { NextRequest } from "next/server";
import { MEDIA_TYPES, UPLOAD_DIR } from "@/lib/uploads";

/** Serves locally uploaded files (local dev without Blob). Production uses Vercel Blob URLs. */
export async function GET(_req: NextRequest, ctx: RouteContext<"/media/[name]">) {
  const { name } = await ctx.params;
  if (!/^[a-z0-9]+-[a-f0-9]{12}\.(png|jpg|webp|gif|avif|pdf)$/.test(name)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const buf = await fs.readFile(path.join(UPLOAD_DIR, name));
    const ext = name.split(".").pop() as string;
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": MEDIA_TYPES[ext],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
