import "server-only";
import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const TYPES: Record<string, { ext: string; kind: "image" | "pdf"; magic: (b: Buffer) => boolean }> = {
  "image/png": { ext: "png", kind: "image", magic: (b) => b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  "image/jpeg": { ext: "jpg", kind: "image", magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/webp": { ext: "webp", kind: "image", magic: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" },
  "image/gif": { ext: "gif", kind: "image", magic: (b) => b.subarray(0, 4).toString() === "GIF8" },
  "image/avif": { ext: "avif", kind: "image", magic: (b) => b.subarray(4, 12).toString().startsWith("ftypavi") },
  "application/pdf": { ext: "pdf", kind: "pdf", magic: (b) => b.subarray(0, 5).toString() === "%PDF-" },
};

const MAX = { image: 8 * 1024 * 1024, pdf: 10 * 1024 * 1024 };

export class UploadError extends Error {}

export const MEDIA_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  pdf: "application/pdf",
};

/** Saves an uploaded image or PDF and returns its public URL. */
export async function saveUpload(file: File, accept: "image" | "pdf" | "any" = "any"): Promise<string> {
  const t = TYPES[file.type];
  if (!t) throw new UploadError("Only PNG, JPG, WebP, GIF, AVIF images or PDF files are allowed.");
  if (accept !== "any" && t.kind !== accept) throw new UploadError(`Please upload a ${accept === "pdf" ? "PDF" : "image"}.`);
  if (file.size > MAX[t.kind]) throw new UploadError(`File is too large (max ${MAX[t.kind] / 1024 / 1024} MB).`);
  const buf = Buffer.from(await file.arrayBuffer());
  if (!t.magic(buf)) throw new UploadError("The file content doesn't match its type.");

  const base = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.${t.ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`portfolio/${base}`, buf, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return blob.url;
  }
  if (process.env.VERCEL) throw new UploadError("Uploads aren't connected yet (BLOB_READ_WRITE_TOKEN missing).");

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, base), buf);
  // Served by app/media/[name]/route.ts so it also works with `next start`.
  return `/media/${base}`;
}
