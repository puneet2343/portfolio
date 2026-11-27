/**
 * Seeds the content store once (safe to run again: existing content is kept).
 *
 *   node --env-file=.env.local scripts/seed-db.mts            # seed if empty + add missing event photos
 *   node --env-file=.env.local scripts/seed-db.mts --force    # overwrite content with the seed
 *
 * Uses MongoDB when MONGODB_URI is set, otherwise ./data/content.json.
 * If PHOTOS_DIR points at a folder with the retouched event photos, the photos that show other
 * people are uploaded to Vercel Blob and added to the Events gallery as HIDDEN items.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { seedContent } from "../lib/seed.ts";

const force = process.argv.includes("--force");

type Photo = { id: string; src: string; alt: string; caption: string; published: boolean };
type Content = typeof seedContent;

const HIDDEN_PHOTOS = [
  {
    id: "ph-colleague",
    file: "07-networking-colleague_retouched.webp",
    alt: "Puneet with a fellow attendee in the congress foyer, both wearing lanyards",
    caption: "With a fellow attendee",
  },
  {
    id: "ph-group",
    file: "08-networking-group-selfie_retouched.webp",
    alt: "Group selfie of Puneet with four colleagues in the congress foyer",
    caption: "With colleagues at the congress",
  },
  {
    id: "ph-banner",
    file: "09-selfie-attendee-ssi-banner_retouched.webp",
    alt: "Selfie of Puneet with another attendee beside the SSI robotics banner",
    caption: "By the SSI banner",
  },
];

async function hiddenPhotos(existing: Photo[]): Promise<Photo[]> {
  const dir = process.env.PHOTOS_DIR;
  if (!dir) return [];
  const out: Photo[] = [];
  for (const p of HIDDEN_PHOTOS) {
    if (existing.some((x) => x.id === p.id)) continue;
    const full = path.join(dir, p.file);
    let buf: Buffer;
    try {
      buf = await fs.readFile(full);
    } catch {
      console.warn(`skip ${p.file}: not found`);
      continue;
    }
    let src = "";
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const blob = await put(`portfolio/events/${p.id}.webp`, buf, {
        access: "public",
        contentType: "image/webp",
        addRandomSuffix: true,
      });
      src = blob.url;
    } else {
      const name = `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 14).padEnd(12, "0")}.webp`;
      await fs.mkdir(path.join("public", "uploads"), { recursive: true });
      await fs.writeFile(path.join("public", "uploads", name), buf);
      src = `/media/${name}`;
    }
    out.push({ id: p.id, src, alt: p.alt, caption: p.caption, published: false });
    console.log(`added hidden photo ${p.id}`);
  }
  return out;
}

async function main() {
  if (process.env.MONGODB_URI) {
    const { MongoClient } = await import("mongodb");
    const client = await new MongoClient(process.env.MONGODB_URI).connect();
    try {
      const col = client.db(process.env.MONGODB_DB || "portfolio").collection<{ _id: string; data: Content }>("content");
      const doc = await col.findOne({ _id: "site" });
      const base: Content = doc && !force ? doc.data : structuredClone(seedContent);
      const extra = await hiddenPhotos(base.events?.photos ?? []);
      base.events = { ...(base.events ?? seedContent.events), photos: [...(base.events?.photos ?? []), ...extra] };
      base.updatedAt = new Date().toISOString();
      await col.updateOne({ _id: "site" }, { $set: { data: base } }, { upsert: true });
      console.log(doc && !force ? "MongoDB: kept existing content" : "MongoDB: seeded content", `(+${extra.length} hidden photos)`);
    } finally {
      await client.close();
    }
    return;
  }
  const file = path.join("data", "content.json");
  let base: Content;
  try {
    base = force ? structuredClone(seedContent) : (JSON.parse(await fs.readFile(file, "utf8")) as Content);
  } catch {
    base = structuredClone(seedContent);
  }
  const extra = await hiddenPhotos(base.events?.photos ?? []);
  base.events = { ...(base.events ?? seedContent.events), photos: [...(base.events?.photos ?? []), ...extra] };
  base.updatedAt = new Date().toISOString();
  await fs.mkdir("data", { recursive: true });
  await fs.writeFile(file, JSON.stringify(base, null, 2));
  console.log(`data/content.json written (+${extra.length} hidden photos)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
