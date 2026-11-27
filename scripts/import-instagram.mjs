#!/usr/bin/env node
/**
 * Bulk-import Instagram media into the Art gallery.
 *
 *   node scripts/import-instagram.mjs <folder> [options]
 *
 * <folder> can be
 *   - an Instagram "Download your information" export (JSON): the folder that contains
 *     your_instagram_activity/media/posts_1.json and/or reels.json (older exports: content/…), or
 *   - a plain folder of photos/videos. Files named <YYYYMMDD>_<postId>_<NN>.<ext> are grouped into one
 *     post (a carousel when there are several). Optional captions: <postId>.txt next to the files,
 *     or a captions.json { "<postId>": "caption" } / meta.tsv (postId<TAB>date<TAB>type<TAB>count<TAB>caption).
 *
 * Options
 *   --account <name>     Instagram account name stored with each item (default: folder name)
 *   --dry-run            Make the web versions (cached), report sizes and Blob budget; upload nothing
 *   --curation <file>    JSON { "<postId>": { "title", "category", "published", "featured", "order", "skip" } }
 *   --limit-gb <n>       Blob storage budget (default 1, the Vercel Hobby limit)
 *   --only <id,id>       Only these post ids
 *
 * What it does, one file at a time at low CPU priority (ffmpeg -threads 2):
 *   images -> WebP, max 2000 px, plus a 720 px thumbnail
 *   videos -> H.264 MP4, max 1080p (long side 1920), CRF 23, AAC, +faststart, a poster JPG and a
 *             short muted 480p preview clip for hover previews
 * Web versions are cached in ./.import-cache (git-ignored). Originals are never uploaded or changed.
 * Items are inserted HIDDEN (published: false) unless the curation file says otherwise.
 * Idempotent: files already imported (same SHA-256) are skipped; curation changes are applied to them.
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

/* ---------------- args + env ---------------- */
const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? def : argv[i + 1];
};
const flag = (name) => argv.includes(`--${name}`);
const ROOT = argv.find((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--") && !["--dry-run"].includes(argv[i - 1])));
if (!ROOT || !existsSync(ROOT)) {
  console.error("Usage: node scripts/import-instagram.mjs <folder> [--account name] [--dry-run] [--curation file.json] [--limit-gb 1]");
  process.exit(1);
}
const DRY = flag("dry-run");
const ACCOUNT = opt("account", path.basename(path.resolve(ROOT)));
const LIMIT = Number(opt("limit-gb", "1")) * 1024 ** 3;
const ONLY = opt("only", "") ? new Set(opt("only", "").split(",")) : null;
const CURATION = opt("curation") ? JSON.parse(readFileSync(opt("curation"), "utf8")) : {};
const CACHE = path.resolve(".import-cache");

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

const IMG = /\.(jpe?g|png|webp|heic|heif|avif|gif)$/i;
const VID = /\.(mp4|mov|m4v|webm)$/i;
const log = (...a) => console.log(...a);
const mb = (b) => `${(b / 1048576).toFixed(1)} MB`;

/* ---------------- helpers ---------------- */
/** Run a tool at low priority and wait for it. */
function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    try {
      os.setPriority(p.pid, os.constants.priority.PRIORITY_LOW);
    } catch {
      /* not allowed: keep default */
    }
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("error", reject);
    p.on("close", (code) => (code === 0 ? resolve(out) : reject(new Error(`${cmd} failed (${code}): ${err.slice(-400)}`))));
  });
}

async function sha256(file) {
  const h = createHash("sha256");
  const fh = await fs.open(file, "r");
  try {
    const buf = Buffer.alloc(1 << 20);
    let n;
    while ((n = (await fh.read(buf, 0, buf.length, null)).bytesRead) > 0) h.update(buf.subarray(0, n));
  } finally {
    await fh.close();
  }
  return h.digest("hex");
}

async function probe(file) {
  const out = await run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:stream_side_data=rotation:stream_tags=rotate:format=duration", "-of", "json", file]);
  const j = JSON.parse(out);
  const s = j.streams?.[0] ?? {};
  let w = s.width ?? 0;
  let h = s.height ?? 0;
  const rot = Math.abs(Number(s.tags?.rotate ?? s.side_data_list?.find((x) => "rotation" in x)?.rotation ?? 0));
  if (rot === 90 || rot === 270) [w, h] = [h, w];
  return { width: w, height: h, duration: Number(j.format?.duration ?? 0) };
}

/** Instagram export strings are UTF-8 bytes stored as Latin-1 code points. */
const fixText = (s) => {
  if (!s) return "";
  try {
    return /[À-ÿ][\u0080-¿]/.test(s) ? Buffer.from(s, "latin1").toString("utf8") : s;
  } catch {
    return s;
  }
};

/** A short human title from a caption: first line, no hashtags, mentions or emoji. */
function titleFrom(caption) {
  const line = (caption || "").split(/\n/).map((l) => l.trim()).find(Boolean) ?? "";
  const t = line
    .replace(/[#@][\p{L}\p{N}_.]+/gu, "")
    .replace(/\p{Extended_Pictographic}|️|‍/gu, "")
    .replace(/\s+/g, " ")
    .replace(/[\s.,;:!-]+$/, "")
    .trim();
  if (!t) return "";
  if (t.length <= 48) return t;
  const cut = t.slice(0, 48);
  return cut.slice(0, cut.lastIndexOf(" ") > 20 ? cut.lastIndexOf(" ") : 48).trim();
}

const RULES = [
  ["festivals", /holi|diwali|festival|ganesh|navratri|durga|aarti|ghat|temple|mandir|vrindavan|barsana|braj|mathura|kumbh/i],
  ["skies", /sky|skies|night|star|milky|moon|sunset|sunrise|dusk|dawn|cloud|aurora|astro/i],
  ["streets", /street|city|market|bazaar|traffic|rain|metro|mumbai|bombay|delhi|jaipur|pink city|lane|alley/i],
  ["travel", /spiti|himachal|ladakh|mountain|valley|lake|river|beach|colombia|travel|trip|road|landscape|forest|nature|village/i],
];
function guessCategory(caption, hasVideo) {
  for (const [id, re] of RULES) if (re.test(caption || "")) return id;
  return hasVideo ? "films-reels" : "travel";
}

/* ---------------- collect posts ---------------- */
async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (IMG.test(e.name) || VID.test(e.name)) out.push(p);
  }
  return out;
}

function exportJson(root) {
  for (const base of ["your_instagram_activity/media", "content", "media"]) {
    const dir = path.join(root, base);
    if (existsSync(path.join(dir, "posts_1.json")) || existsSync(path.join(dir, "reels.json"))) return dir;
  }
  return null;
}

async function collect(root) {
  const jsonDir = exportJson(root);
  const posts = [];
  if (jsonDir) {
    const read = (f) => (existsSync(path.join(jsonDir, f)) ? JSON.parse(readFileSync(path.join(jsonDir, f), "utf8")) : null);
    const raw = [];
    for (const f of (await fs.readdir(jsonDir)).filter((f) => /^posts_\d+\.json$/.test(f))) raw.push(...(read(f) ?? []));
    const reels = read("reels.json");
    raw.push(...(reels?.ig_reels_media ?? reels ?? []));
    for (const p of raw) {
      const media = (p.media ?? []).filter((m) => m.uri && !/^https?:/.test(m.uri));
      if (!media.length) continue;
      const files = media.map((m) => path.join(root, m.uri)).filter((f) => existsSync(f));
      if (!files.length) continue;
      const ts = p.creation_timestamp ?? media[0].creation_timestamp ?? statSync(files[0]).mtimeMs / 1000;
      const caption = fixText(p.title || media[0].title || "");
      const id = path.basename(files[0]).replace(/\.[^.]+$/, "");
      posts.push({ id, date: new Date(ts * 1000).toISOString().slice(0, 10), caption, files });
    }
    log(`Export mode: ${posts.length} posts from ${path.relative(root, jsonDir) || "."}`);
    return posts;
  }

  // Plain folder
  const files = (await walk(root)).sort();
  const captions = {};
  const cj = path.join(root, "captions.json");
  if (existsSync(cj)) Object.assign(captions, JSON.parse(readFileSync(cj, "utf8")));
  const tsv = path.join(root, "meta.tsv");
  if (existsSync(tsv)) {
    for (const line of readFileSync(tsv, "utf8").split(/\r?\n/)) {
      const [pid, , , , cap] = line.split("\t");
      if (pid && cap && !captions[pid]) captions[pid] = cap;
    }
  }
  const groups = new Map();
  for (const f of files) {
    const m = path.basename(f).match(/^(\d{8})_([A-Za-z0-9_-]+?)_(\d+)\.[^.]+$/);
    const key = m ? m[2] : path.basename(f).replace(/\.[^.]+$/, "");
    if (!groups.has(key)) {
      const d = m ? `${m[1].slice(0, 4)}-${m[1].slice(4, 6)}-${m[1].slice(6, 8)}` : new Date(statSync(f).mtimeMs).toISOString().slice(0, 10);
      groups.set(key, { id: key, date: d, caption: "", files: [] });
    }
    groups.get(key).files.push(f);
  }
  for (const g of groups.values()) {
    g.files.sort();
    // A .jpg with the same name as a video is that video's cover frame, not a separate photo.
    g.posters = {};
    const vids = new Set(g.files.filter((f) => VID.test(f)).map((f) => f.replace(/\.[^.]+$/, "")));
    g.files = g.files.filter((f) => {
      const base = f.replace(/\.[^.]+$/, "");
      if (IMG.test(f) && vids.has(base)) {
        const v = g.files.find((x) => VID.test(x) && x.replace(/\.[^.]+$/, "") === base);
        g.posters[v] = f;
        return false;
      }
      return true;
    });
    const side = path.join(path.dirname(g.files[0]), `${g.id}.txt`);
    g.caption = captions[g.id] ?? (existsSync(side) ? readFileSync(side, "utf8").trim() : "");
  }
  const posts2 = [...groups.values()];
  log(`Folder mode: ${files.length} files in ${posts2.length} posts`);
  return posts2;
}

/* ---------------- make web versions (cached by hash) ---------------- */
/** Black-bar box of a clip (crop=w:h:x:y), measured over a few seconds. */
async function detectCrop(file) {
  const r = await new Promise((resolve) => {
    const p = spawn("ffmpeg", ["-hide_banner", "-ss", "1", "-t", "6", "-i", file, "-vf", "cropdetect=24:2:0", "-threads", "2", "-f", "null", "-"], { windowsHide: true });
    try {
      os.setPriority(p.pid, os.constants.priority.PRIORITY_LOW);
    } catch {
      /* ignore */
    }
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", () => resolve(err));
  });
  const all = [...r.matchAll(/crop=(\d+):(\d+):(\d+):(\d+)/g)];
  return all.length ? all[all.length - 1][0] : "";
}

async function webVersions(file, hash, o = {}) {
  const dir = path.join(CACHE, hash.slice(0, 2));
  await fs.mkdir(dir, { recursive: true });
  const isVideo = VID.test(file);
  // Different treatment, different cache entry.
  if (o.rotate || o.crop) hash = `${hash}-${o.rotate ?? "n"}${o.crop ? "c" : ""}`;
  const out = isVideo
    ? { main: path.join(dir, `${hash}.mp4`), poster: path.join(dir, `${hash}-poster.jpg`), preview: path.join(dir, `${hash}-preview.mp4`), thumb: path.join(dir, `${hash}-thumb.webp`) }
    : { main: path.join(dir, `${hash}.webp`), thumb: path.join(dir, `${hash}-thumb.webp`) };
  const metaFile = path.join(dir, `${hash}.json`);
  if (existsSync(metaFile) && Object.values(out).every((p) => existsSync(p))) return { ...JSON.parse(readFileSync(metaFile, "utf8")), out, isVideo };

  const T = ["-threads", "2"];
  let meta;
  if (isVideo) {
    meta = await probe(file);
    const crop = o.crop ? await detectCrop(file) : "";
    const turn = o.rotate === "ccw" ? "transpose=2" : o.rotate === "cw" ? "transpose=1" : "";
    const pre = [crop, turn].filter(Boolean);
    const fit = [...pre, "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'"].join(",");
    await run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", file, "-map", "0:v:0", "-map", "0:a:0?", "-vf", fit, "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-profile:v", "high", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", ...T, out.main]);
    const pfit = "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))'";
    // Instagram's own cover frame when there is one and the clip keeps its shape; else a frame from the clip.
    if (o.poster && !pre.length) await run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", o.poster, "-frames:v", "1", "-vf", pfit, "-q:v", "4", ...T, out.poster]);
    else {
      const at = Math.min(1.5, Math.max(0, meta.duration / 3)).toFixed(2);
      await run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-ss", at, "-i", out.main, "-frames:v", "1", "-vf", pfit, "-q:v", "4", ...T, out.poster]);
    }
    await run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", out.poster, "-vf", "scale='if(gt(iw,ih),min(720,iw),-2)':'if(gt(iw,ih),-2,min(720,ih))'", "-c:v", "libwebp", "-quality", "74", ...T, out.thumb]);
    const pss = meta.duration > 8 ? "1" : "0";
    await run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-ss", pss, "-t", "6", "-i", out.main, "-an", "-vf", "scale='if(gt(iw,ih),min(854,iw),-2)':'if(gt(iw,ih),-2,min(854,ih))',fps=24", "-c:v", "libx264", "-preset", "medium", "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart", ...T, out.preview]);
    const p = await probe(out.main);
    meta = { width: p.width, height: p.height, duration: p.duration };
  } else {
    const fit = (n) => `scale='if(gt(iw,ih),min(${n},iw),-2)':'if(gt(iw,ih),-2,min(${n},ih))'`;
    await run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", file, "-vf", fit(2000), "-c:v", "libwebp", "-quality", "82", "-frames:v", "1", ...T, out.main]);
    await run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", out.main, "-vf", fit(720), "-c:v", "libwebp", "-quality", "74", "-frames:v", "1", ...T, out.thumb]);
    const p = await probe(out.main);
    meta = { width: p.width, height: p.height, duration: 0 };
  }
  await fs.writeFile(metaFile, JSON.stringify(meta));
  return { ...meta, out, isVideo };
}

/* ---------------- storage ---------------- */
async function openDb() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing (.env.local).");
  const { MongoClient } = await import("mongodb");
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  return { client, col: client.db(process.env.MONGODB_DB || "portfolio").collection("art") };
}

async function blobUsage() {
  const { list } = await import("@vercel/blob");
  let cursor;
  let total = 0;
  do {
    const r = await list({ cursor, limit: 1000 });
    for (const b of r.blobs) total += b.size;
    cursor = r.cursor;
  } while (cursor);
  return total;
}

async function upload(local, key, contentType) {
  const { put } = await import("@vercel/blob");
  const body = await fs.readFile(local);
  const r = await put(key, body, { access: "public", contentType, addRandomSuffix: false, allowOverwrite: true, multipart: body.length > 50 * 1024 * 1024 });
  return r.url;
}

/* ---------------- main ---------------- */
const posts = (await collect(ROOT)).filter((p) => !ONLY || ONLY.has(p.id));
const { client, col } = await openDb();
try {
  // 1) hash + skip what is already imported
  const plan = [];
  let skipped = 0;
  for (const p of posts) {
    const cur = CURATION[p.id] ?? {};
    if (Array.isArray(cur.exclude)) p.files = p.files.filter((f) => !cur.exclude.includes(Number(path.basename(f).match(/_(\d+)\.[^.]+$/)?.[1])));
    p.hashes = [];
    for (const f of p.files) p.hashes.push(await sha256(f));
    const existing = await col.findOne({ hashes: { $in: p.hashes } });
    if (existing) {
      skipped++;
      const set = {};
      for (const k of ["title", "category", "published", "featured", "order"]) if (k in cur && cur[k] !== existing[k]) set[k] = cur[k];
      if (Object.keys(set).length && !DRY) {
        await col.updateOne({ _id: existing._id }, { $set: { ...set, updatedAt: new Date().toISOString() } });
        log(`curation applied to ${p.id}: ${Object.keys(set).join(", ")}`);
      }
      continue;
    }
    if (cur.skip) {
      log(`skip ${p.id} (curation)`);
      continue;
    }
    plan.push(p);
  }
  log(`${posts.length} posts: ${skipped} already imported, ${plan.length} to import.`);

  // 2) web versions (one file at a time)
  let total = 0;
  let n = 0;
  for (const p of plan) {
    p.web = [];
    for (let i = 0; i < p.files.length; i++) {
      n++;
      process.stdout.write(`  [${n}] ${path.basename(p.files[i])} … `);
      const cur = CURATION[p.id] ?? {};
      const w = await webVersions(p.files[i], p.hashes[i], { rotate: cur.rotate, crop: cur.crop, poster: p.posters?.[p.files[i]] });
      const size = (await Promise.all(Object.values(w.out).map((f) => fs.stat(f).then((s) => s.size)))).reduce((a, b) => a + b, 0);
      total += size;
      p.web.push(w);
      log(`${w.isVideo ? "video" : "image"} ${w.width}x${w.height} → ${mb(size)}`);
    }
  }

  // 3) budget
  const used = process.env.BLOB_READ_WRITE_TOKEN ? await blobUsage() : 0;
  const after = used + total;
  log(`\nNew web files: ${mb(total)}. Blob store now: ${mb(used)}. After import: ${mb(after)} of ${mb(LIMIT)} (${((after / LIMIT) * 100).toFixed(1)}%).`);
  if (after > LIMIT * 0.95) {
    log("STOP: this would go over the Blob storage limit (95% safety margin). Nothing was uploaded.");
    log("Use --only <ids> or a curation file with skip: true to import fewer posts.");
    process.exitCode = 2;
  } else if (DRY) {
    log("Dry run: nothing uploaded. Run again without --dry-run to upload (cached web versions are reused).");
  } else {
    if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is missing (.env.local).");
    const acct = ACCOUNT.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
    for (const p of plan) {
      const cur = CURATION[p.id] ?? {};
      const media = [];
      let thumb = "";
      for (let i = 0; i < p.web.length; i++) {
        const w = p.web[i];
        const key = `portfolio/art/${acct}/${p.id}-${String(i + 1).padStart(2, "0")}-${p.hashes[i].slice(0, 8)}`;
        const src = await upload(w.out.main, `${key}.${w.isVideo ? "mp4" : "webp"}`, w.isVideo ? "video/mp4" : "image/webp");
        const t = await upload(w.out.thumb, `${key}-thumb.webp`, "image/webp");
        const poster = w.isVideo ? await upload(w.out.poster, `${key}-poster.jpg`, "image/jpeg") : "";
        const preview = w.isVideo ? await upload(w.out.preview, `${key}-preview.mp4`, "video/mp4") : "";
        if (i === 0) thumb = t;
        media.push({ type: w.isVideo ? "video" : "image", src, poster, preview, width: w.width, height: w.height });
      }
      const now = new Date().toISOString();
      const hasVideo = media.some((m) => m.type === "video");
      const doc = {
        _id: `ig-${acct}-${p.id}`.slice(0, 80),
        title: cur.title ?? titleFrom(p.caption),
        caption: p.caption,
        category: cur.category ?? guessCategory(p.caption, hasVideo),
        media,
        thumb,
        date: p.date,
        order: cur.order ?? 0,
        featured: cur.featured ?? false,
        published: cur.published ?? false,
        source: "instagram",
        account: ACCOUNT,
        hashes: p.hashes,
        createdAt: now,
        updatedAt: now,
      };
      await col.replaceOne({ _id: doc._id }, doc, { upsert: true });
      log(`imported ${p.id} → ${doc.category}${doc.published ? " (published)" : " (hidden)"}: ${doc.title || "untitled"}`);
    }
    log(`\nDone: ${plan.length} posts imported.`);
  }
} finally {
  await client.close();
}
