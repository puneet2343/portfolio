import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { NextRequest } from "next/server";
import { guardAdmin } from "@/lib/auth";

/**
 * Issues short-lived tokens so the admin can upload large files (film videos) straight from the
 * browser to Vercel Blob, bypassing the serverless request-size limit. Admin session required.
 */
export async function POST(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "Uploads aren't connected yet (BLOB_READ_WRITE_TOKEN missing)." }, { status: 400 });
  }
  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("portfolio/films/")) throw new Error("Bad upload path.");
        return {
          allowedContentTypes: ["video/webm", "video/mp4", "video/quicktime"],
          maximumSizeInBytes: 200 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 400 });
  }
}
