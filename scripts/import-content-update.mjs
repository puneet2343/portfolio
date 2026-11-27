#!/usr/bin/env node
/**
 * Imports a researched content update (projects with case studies, skills, SS Innovations bullets,
 * a remove/hide list) into the site content in MongoDB, or ./data/content.json without MONGODB_URI.
 *
 *   node scripts/import-content-update.mjs <content_update.json> [--dry-run]
 *
 * Idempotent: running it twice gives the same result. Existing screenshots, covers and product demo
 * videos are kept where a project matches. The event platform goes first and is featured.
 */
import { createHash } from "node:crypto";
import { existsSync, promises as fs, readFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const DRY = args.includes("--dry-run");
if (!file) {
  console.error("Usage: node scripts/import-content-update.mjs <content_update.json> [--dry-run]");
  process.exit(1);
}

// Load .env.local without printing anything from it.
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

const update = JSON.parse(await fs.readFile(file, "utf8"));

/* ---------------- storage ---------------- */
let client;
async function loadContent() {
  if (process.env.MONGODB_URI) {
    const { MongoClient } = await import("mongodb");
    client = await MongoClient.connect(process.env.MONGODB_URI);
    const col = client.db(process.env.MONGODB_DB || "portfolio").collection("content");
    const doc = await col.findOne({ _id: "site" });
    if (!doc?.data) throw new Error("No content in MongoDB yet. Run `npm run seed` first.");
    return { data: doc.data, save: (d) => col.updateOne({ _id: "site" }, { $set: { data: d } }) };
  }
  const p = path.join("data", "content.json");
  const data = JSON.parse(await fs.readFile(p, "utf8"));
  return { data, save: (d) => fs.writeFile(p, JSON.stringify(d, null, 2)) };
}

/* ---------------- projects ---------------- */
// New slug -> ids of existing projects it replaces (first one is kept and updated).
const MATCH = {
  "ssi-events": ["prj-events"],
  "ssi-studios": ["prj-studios"],
  "instrument-tracking": ["prj-jaw"],
  "company-websites": ["prj-corporate", "prj-smrsc", "prj-crs"],
};
const CONTEXT = { personal: "Personal project" };
const sid = (s) => "prj-" + createHash("sha1").update(s).digest("hex").slice(0, 8);

function toProject(u, prev, merged) {
  const cs = u.caseStudy ?? {};
  const covers = [...new Set([prev, ...merged].map((p) => p?.cover).filter(Boolean))];
  const gallery = [...new Set([...covers.slice(1), ...[prev, ...merged].flatMap((p) => p?.gallery ?? [])])].filter((g) => g !== covers[0]);
  return {
    id: prev?.id ?? sid(u.slug),
    slug: u.slug,
    title: u.title,
    tagline: u.oneLiner ?? "",
    context: CONTEXT[u.status] ?? "SS Innovations International",
    period: u.period ?? "",
    cover: covers[0] ?? "",
    gallery,
    liveUrl: u.liveUrl ?? "",
    repoUrl: u.repoPublic && u.repoUrl ? u.repoUrl : prev?.repoUrl && u.repoPublic ? prev.repoUrl : "",
    tech: (u.stack ?? []).slice(0, 16),
    problem: cs.problem ?? "",
    role: u.role ?? "",
    overview: cs.whatIBuilt ?? "",
    architecture: cs.architecture ?? "",
    challenges: cs.challenges ?? "",
    built: u.highlights ?? [],
    impact: cs.impact ? [cs.impact] : [],
    demoVideo: prev?.demoVideo ?? "",
    demoPoster: prev?.demoPoster ?? "",
    demoCaption: prev?.demoCaption ?? "",
    featured: u.slug === "ssi-events" ? true : Boolean(u.featured),
    published: true,
  };
}

/* ---------------- skills ---------------- */
const CATS = [
  { from: "Languages", id: "LANGUAGES", label: "Languages", icon: "code" },
  { from: "Frontend", id: "FRONTEND", label: "Frontend", icon: "layout" },
  { from: "Backend", id: "BACKEND", label: "Backend", icon: "server" },
  { from: "Data", id: "DATA", label: "Data", icon: "database" },
  { from: "Cloud & DevOps", id: "CLOUD", label: "Cloud & DevOps", icon: "cloud" },
  { from: "AI & ML", id: "AI", label: "AI & ML", icon: "zap" },
  { from: "XR", id: "XR", label: "XR", icon: "monitor" },
  { from: "Tools", id: "TOOLS", label: "Tools", icon: "terminal" },
];
const ICON_BY_NAME = [
  [/git/i, "git"],
  [/maps/i, "globe"],
  [/three/i, "layers"],
  [/tailwind|framer/i, "layers"],
  [/socket|sent events|webrtc/i, "zap"],
  [/mongo|dynamo|redis|sql/i, "database"],
  [/docker|nginx|ci\/cd/i, "terminal"],
];
const NO_PUBLIC = /linkedin|this pc|resume|no code|not used|not found|approximate/i;

/** Turn the research "evidence" into a short public line: keep only the project names and facts. */
function cleanEvidence(e) {
  return (e ?? "")
    .split(/;\s*/)
    .map((part) => part.replace(/\s*\((?:[^()]*(?:LinkedIn|resume|\/)[^()]*)\)/gi, "").trim())
    .filter((part) => part && !NO_PUBLIC.test(part))
    .join("; ")
    .replace(/\s+/g, " ")
    .slice(0, 160);
}

// Short public lines for skills whose research note had nothing publishable.
const FALLBACK = {
  SQL: "Relational schemas, joins and queries.",
  "Express.js / NestJS": "REST services on Node.js.",
  PostgreSQL: "Database for a learning management system.",
  MySQL: "Relational schemas and queries.",
  "AWS EC2": "Virtual servers on AWS.",
  "Meta XR Interaction SDK": "Hand and controller interaction for Meta Quest.",
  Figma: "Interface design and prototypes.",
};

function toSkill(s, i) {
  const cat = CATS.find((c) => c.from === s.category) ?? CATS[CATS.length - 1];
  const icon = ICON_BY_NAME.find(([re]) => re.test(s.name))?.[1] ?? cat.icon;
  const ev = s.evidence ?? "";
  const companies = [];
  if (/SSI|SS Innovations|Maya|company website|Instrument/i.test(ev)) companies.push("ssi");
  if (/B\.Tech/i.test(ev)) companies.push("gla");
  return {
    id: "sk-" + createHash("sha1").update(s.name).digest("hex").slice(0, 8),
    name: s.name,
    category: cat.id,
    tag: cat.label,
    year: s.sinceYear ? String(s.sinceYear) : "",
    icon,
    companies,
    description: FALLBACK[s.name] && cleanEvidence(ev).length < 12 ? FALLBACK[s.name] : cleanEvidence(ev),
    published: true,
    _order: (s.sinceYear ? 0 : 1000) + i, // LinkedIn-only skills (no year) go last
  };
}

/* ---------------- run ---------------- */
const { data, save } = await loadContent();
const before = JSON.stringify(data);
const old = data.projects ?? [];
const used = new Set();
const report = [];

const incoming = [...update.projects].sort((a, b) => (a.slug === "ssi-events" ? -1 : b.slug === "ssi-events" ? 1 : (a.order ?? 99) - (b.order ?? 99)));
const next = incoming.map((u) => {
  const ids = MATCH[u.slug] ?? [];
  const bySlug = old.find((p) => p.slug === u.slug);
  const matches = [bySlug, ...ids.map((id) => old.find((p) => p.id === id))].filter(Boolean);
  const [prev, ...merged] = [...new Set(matches)];
  if (prev) used.add(prev.id);
  report.push(`${prev ? "update" : "add   "} ${u.slug}${merged.length ? ` (merges ${merged.map((m) => m.slug).join(", ")})` : ""}`);
  return toProject(u, prev, merged);
});

// Projects not in the update: delete MediLens, hide the rest (merged ones were hidden by being replaced).
const REMOVE = new Set(["prj-medilens", "medilens"]);
for (const p of old) {
  if (used.has(p.id)) continue;
  if (REMOVE.has(p.id) || REMOVE.has(p.slug)) {
    report.push(`remove ${p.slug}`);
    continue;
  }
  report.push(`hide   ${p.slug}`);
  next.push({ ...p, published: false, featured: false });
}

/*
 * Public showcase (owner's rule): exactly these six, in this order. No code links anywhere; the
 * applications get no live links; only the three websites link out (URLs checked to load).
 * Everything else stays in the data, hidden.
 */
const SHOWCASE = [
  { id: "prj-events", set: { featured: true } },
  {
    id: "prj-smrsc",
    set: {
      slug: "smrsc-2026",
      title: "SMRSC 2026 website",
      tagline: "Website for SMRSC 2026, SS Innovations' international conference on robotic surgery.",
      liveUrl: "https://smrsc.vercel.app/home",
      cover: "/images/projects/smrsc.png",
      gallery: [],
      impact: ["Schedules, faculty and media are managed as content instead of being hard-coded."],
    },
  },
  {
    id: "prj-crs",
    set: {
      slug: "ssi-crs",
      title: "SSI CRS website",
      tagline: "Website for the SSI CRS training program, where surgeons learn the SSi Mantra robotic system.",
      liveUrl: "https://ssicrsweb.vercel.app/Home",
      cover: "/images/projects/ssicrs.png",
      gallery: [],
      built: [
        "Pages that explain the training program and its hands-on courses on the SSi Mantra system.",
        "A short enrolment flow for surgeons and clinical staff.",
        "Responsive pages set up for search, with a sitemap and page metadata.",
      ],
    },
  },
  {
    id: "prj-corporate",
    set: {
      slug: "ss-innovations-website",
      title: "SS Innovations website",
      tagline: "Corporate website for SS Innovations, with product pages and 3D visuals of the SSi Mantra surgical robot.",
      context: "SS Innovations International",
      liveUrl: "https://ssinnovations.com/",
      cover: "/images/projects/ssinnovations.webp",
      gallery: [],
      problem: "SS Innovations needed a public website that shows its surgical robots and telesurgery work to surgeons, hospitals and investors, and stays fast on phones.",
      role: "Developer",
      overview: "Next.js App Router site with reusable section components, product pages for SSi Mantra, SSI Maya, SSI Mudra and telesurgery, and 3D product visuals.",
      architecture: "Next.js App Router with content in typed data files; Three.js and React Three Fiber scenes load only when their section comes into view.",
      challenges: "Keeping the 3D scenes and media-heavy pages fast on phones: lazy-loaded sections, dynamic imports, optimised images and self-hosted fonts.",
      built: [
        "Product pages for SSi Mantra, SSI Maya, SSI Mudra and telesurgery.",
        "3D product visuals of the SSi Mantra robot built with Three.js and React Three Fiber.",
        "Performance work: lazy-loaded sections, dynamic imports, Next.js image optimisation and self-hosted fonts.",
      ],
      impact: [],
      tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Three.js", "React Three Fiber", "Framer Motion"],
    },
  },
  {
    id: "prj-jaw",
    set: {
      title: "Real-time instrument angle tracking (NDI sensors)",
      overview: "A Python program that reads 6-DoF poses from NDI optical trackers in real time and uses a PyTorch model to estimate the opening angle between the instrument's jaws while it moves.",
      architecture: "",
      challenges: "",
      impact: [],
    },
  },
  { id: "prj-studios", set: {} },
];
const WEBSITES = new Set(["prj-smrsc", "prj-crs", "prj-corporate"]);
const byId = new Map(next.map((p) => [p.id, p]));
const shown = [];
for (const s of SHOWCASE) {
  const p = byId.get(s.id);
  if (!p) {
    report.push(`missing showcase project ${s.id}`);
    continue;
  }
  Object.assign(p, s.set, { published: true });
  shown.push(p);
}
for (const p of next) {
  p.repoUrl = "";
  if (!WEBSITES.has(p.id)) p.liveUrl = "";
  if (!shown.includes(p)) Object.assign(p, { published: false, featured: false });
}
data.projects = [...shown, ...next.filter((p) => !shown.includes(p))];

// The applications are internal: no addresses of them in any public text either.
const APP_URL = /\s*\(?\b(?:https?:\/\/)?(?:events\.ssistudios\.com|ssistudios\.vercel\.app|ssistudios\.com)\b\)?/gi;
const scrub = (s) =>
  typeof s === "string"
    ? s
        .replace(/\bat events\.ssistudios\.com\s+/gi, "")
        .replace(APP_URL, "")
        // research notes, not public copy
        .replace(/\s*No attendee or booking totals[^.]*\./gi, "")
        .replace(/\s*No usage figures[^.]*\./gi, "")
        .replace(/The project documentation estimates under USD 1 for an idle month\./gi, "An idle month costs under USD 1 to run.")
        .replace(/\s{2,}/g, " ")
        .trim()
    : s;
const scrubObj = (o) => {
  for (const k of Object.keys(o)) {
    if (k === "liveUrl" || k === "cover" || k === "gallery" || k === "demoVideo" || k === "demoPoster") continue;
    o[k] = Array.isArray(o[k]) ? o[k].map(scrub) : scrub(o[k]);
  }
};
data.projects.forEach(scrubObj);
report.push(`showcase: ${shown.map((p) => p.slug).join(", ")}`);

// Skills + filter tabs
const skills = update.skills.map(toSkill).sort((a, b) => {
  const ca = CATS.findIndex((c) => c.id === a.category);
  const cb = CATS.findIndex((c) => c.id === b.category);
  return ca - cb || a._order - b._order;
});
const skipSkill = /^(electron|fastapi)$/i;
data.skills = skills.filter((s) => !skipSkill.test(s.name)).map(({ _order, ...s }) => s);
const allLabel = data.skillCategories?.find((c) => c.id === "ALL")?.label ?? "Ecosystem";
data.skillCategories = [{ id: "ALL", label: allLabel, wide: false }, ...CATS.filter((c) => data.skills.some((s) => s.category === c.id)).map((c) => ({ id: c.id, label: c.label, wide: false }))];
report.push(`skills ${data.skills.length} in ${data.skillCategories.length - 1} categories`);

// SS Innovations experience bullets
const exp = data.experience?.find((x) => /SS Innovations/i.test(x.company));
if (exp && update.experienceBullets?.length) {
  exp.points = update.experienceBullets.map(scrub);
  exp.tech = ["Next.js", "TypeScript", "AWS Lambda", "DynamoDB", "MongoDB", "Socket.IO", "Three.js", "Python"];
  report.push(`experience ${exp.id}: ${exp.points.length} bullets`);
}

// GLA extra claims stay hidden until confirmed
for (const e of data.education ?? []) if (/unconfirmed/i.test(e.school)) e.published = false;

const changed = JSON.stringify(data) !== before;
if (changed) data.updatedAt = new Date().toISOString();
console.log(report.join("\n"));
if (DRY) {
  for (const sk of data.skills) console.log(`  ${sk.category.padEnd(9)} ${sk.name} [${sk.year || "-"}] ${sk.companies.join("/")} :: ${sk.description}`);
  console.log("\nDry run: nothing saved.");
} else if (changed) {
  await save(data);
  console.log("\nSaved.");
} else console.log("\nAlready up to date.");
await client?.close();
