import type { NextRequest } from "next/server";
import { guardAdmin } from "@/lib/auth";
import { UploadError, saveUpload } from "@/lib/uploads";

export async function POST(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Expected a file upload." }, { status: 400 });
  }
  const file = form.get("file");
  const accept = form.get("accept");
  if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });
  try {
    const url = await saveUpload(file, accept === "pdf" || accept === "image" ? accept : "any");
    return Response.json({ url });
  } catch (err) {
    if (err instanceof UploadError) return Response.json({ error: err.message }, { status: 400 });
    console.error("upload failed", err);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
