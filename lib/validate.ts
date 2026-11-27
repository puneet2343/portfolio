import type { ArtItem, ArtMedia, ContentKey, SiteContent } from "./types";

/**
 * Tiny shape-based sanitiser for admin edits: keeps only known fields, coerces types,
 * trims/caps strings and blocks unsafe URL schemes.
 *  "s" = string, "t" = long text, "u" = url, "b" = boolean, [shape] = array, {..} = object
 */
type Shape = "s" | "t" | "u" | "b" | Shape[] | { [k: string]: Shape };

const SA: Shape = ["s"];
const TA: Shape = ["t"];
const UA: Shape = ["u"];

const shapes: Record<ContentKey, Shape> = {
  profile: {
    name: "s", role: "s", company: "s", location: "s", badge: "s", headline: "t", pitch: "t",
    email: "s", resumeUrl: "u", avatarUrl: "u", aboutPhotoUrl: "u", workPhotoUrl: "u", avatarAlt: "s", aboutPhotoAlt: "s", workPhotoAlt: "s",
  },
  about: { heading: "s", paragraphs: TA, facts: [{ label: "s", value: "s" }] },
  experience: [
    {
      id: "s", company: "s", role: "s", type: "s", start: "s", end: "s", location: "s", logo: "u", summary: "t",
      points: TA, tech: SA, published: "b",
    },
  ],
  projects: [
    {
      id: "s", slug: "s", title: "s", tagline: "t", context: "s", period: "s", cover: "u", gallery: UA,
      liveUrl: "u", repoUrl: "u", tech: SA, problem: "t", role: "s", overview: "t", architecture: "t", challenges: "t", built: TA, impact: TA, demoVideo: "u", demoPoster: "u", demoCaption: "s",
      featured: "b", published: "b",
    },
  ],
  hero: { role: "s", company: "s", location: "s", hire: "s", skills: [{ key: "s", items: SA }], readme: "t", styles: "t" },
  skillCategories: [{ id: "s", label: "s", wide: "b" }],
  skills: [
    { id: "s", name: "s", category: "s", tag: "s", year: "s", icon: "s", companies: SA, description: "t", published: "b" },
  ],
  education: [
    {
      id: "s", school: "s", degree: "s", start: "s", end: "s", location: "s", grade: "s", logo: "u",
      summary: "t", highlights: TA, tags: SA, published: "b",
    },
  ],
  events: { heading: "s", intro: "t", photos: [{ id: "s", src: "u", alt: "s", caption: "s", published: "b" }] },
  beyond: {
    kicker: "s", heading: "s", headingAccent: "s", intro: "t",
    items: [
      {
        id: "s", kicker: "s", title: "s", titleAccent: "s", quote: "t", tags: SA, video: "u", poster: "u",
        rotate: "b", videoRight: "b", theme: "s", published: "b",
      },
    ],
  },
  art: {
    kicker: "s", heading: "s", headingAccent: "s", intro: "t", galleryHeading: "s", galleryIntro: "t", instagramUrl: "u", heroVideo: "u", heroPoster: "u",
    categories: [{ id: "s", label: "s" }],
  },
  social: [{ id: "s", label: "s", url: "u", icon: "s", published: "b" }],
  sections: [{ id: "s", label: "s", visible: "b" }],
  seo: { title: "s", description: "t", keywords: SA, siteUrl: "u" },
  theme: { accent: "s", accent2: "s", defaultMode: "s" },
  contact: { heading: "s", blurb: "t", formEnabled: "b" },
};

export const CONTENT_KEYS = Object.keys(shapes) as ContentKey[];

function cleanUrl(v: string) {
  const s = v.trim().slice(0, 2000);
  if (!s) return "";
  if (/^(https?:|mailto:|tel:)/i.test(s) || s.startsWith("/")) return s;
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return ""; // javascript:, data:, etc.
  return `https://${s}`;
}

function sanitize(value: unknown, shape: Shape): unknown {
  if (shape === "s" || shape === "t") return typeof value === "string" ? value.trim().slice(0, shape === "s" ? 300 : 5000) : "";
  if (shape === "u") return typeof value === "string" ? cleanUrl(value) : "";
  if (shape === "b") return value === true;
  if (Array.isArray(shape)) {
    if (!Array.isArray(value)) return [];
    const out = value.slice(0, 200).map((v) => sanitize(v, shape[0]));
    // drop empty strings from string lists
    return typeof shape[0] === "string" ? out.filter((x) => x !== "") : out;
  }
  const obj = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, s] of Object.entries(shape)) out[k] = sanitize(obj[k], s);
  return out;
}

export function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "project"
  );
}

const ICONS = new Set(["github", "linkedin", "email", "website", "x", "youtube", "instagram"]);
const SECTIONS = new Set(["about", "experience", "projects", "skills", "education", "events", "contact"]);

export function sanitizeContentPart<K extends ContentKey>(key: K, value: unknown): SiteContent[K] {
  const v = sanitize(value, shapes[key]) as never;
  const rid = () => Math.random().toString(36).slice(2, 10);

  if (Array.isArray(v)) {
    for (const item of v as { id?: string }[]) if (item && typeof item === "object" && "id" in item && !item.id) item.id = rid();
  }
  if (key === "projects") {
    const seen = new Set<string>();
    for (const p of v as unknown as SiteContent["projects"]) {
      let slug = slugify(p.slug || p.title);
      while (seen.has(slug)) slug = `${slug}-2`;
      seen.add(slug);
      p.slug = slug;
      if (!p.title) p.title = "Untitled project";
    }
  }
  if (key === "events") {
    for (const p of (v as unknown as SiteContent["events"]).photos) if (!p.id) p.id = rid();
  }
  if (key === "beyond") {
    const themes = ["gold", "orange", "blue", "sunset", "purple"];
    for (const p of (v as unknown as SiteContent["beyond"]).items) {
      if (!p.id) p.id = rid();
      if (!themes.includes(p.theme)) p.theme = "gold";
    }
  }
  if (key === "skills") {
    const icons = ["globe", "layout", "code", "zap", "layers", "server", "database", "terminal", "git", "cloud", "monitor", "hash"];
    for (const sk of v as unknown as SiteContent["skills"]) {
      sk.category = (sk.category || "TOOLS").toUpperCase().replace(/[^A-Z0-9_-]/g, "") || "TOOLS";
      if (!icons.includes(sk.icon)) sk.icon = "code";
    }
  }
  if (key === "skillCategories") {
    const list = v as unknown as SiteContent["skillCategories"];
    for (const c of list) c.id = (c.id || c.label).toUpperCase().replace(/[^A-Z0-9_-]/g, "") || "OTHER";
    if (!list.some((c) => c.id === "ALL")) list.unshift({ id: "ALL", label: "Ecosystem", wide: false });
  }
  if (key === "art") {
    const a = v as unknown as SiteContent["art"];
    const seen = new Set<string>();
    a.categories = a.categories.filter((c) => {
      c.id = slugify(c.id || c.label);
      if (!c.label) c.label = c.id;
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }
  if (key === "social") {
    for (const s of v as unknown as SiteContent["social"]) if (!ICONS.has(s.icon)) s.icon = "website";
  }
  if (key === "sections") {
    const list = (v as unknown as SiteContent["sections"]).filter((s) => SECTIONS.has(s.id));
    return list as never;
  }
  if (key === "theme") {
    const t = v as unknown as SiteContent["theme"];
    const hex = /^#[0-9a-f]{6}$/i;
    if (!hex.test(t.accent)) t.accent = "#007acc";
    if (!hex.test(t.accent2)) t.accent2 = "#10b981";
    if (t.defaultMode !== "dark" && t.defaultMode !== "light") t.defaultMode = "system";
  }
  return v;
}

const ART_ITEM: Shape = {
  id: "s", title: "s", caption: "t", category: "s", thumb: "u", date: "s", featured: "b", published: "b",
  source: "s", account: "s", hashes: SA,
  media: [{ type: "s", src: "u", poster: "u", preview: "u" }],
};

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i;

/** Clean an art item coming from the admin. Keeps server-managed fields (source, hashes, createdAt) from `prev`. */
export function sanitizeArtItem(value: unknown, prev?: ArtItem): ArtItem {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const v = sanitize(raw, ART_ITEM) as Omit<ArtItem, "order" | "createdAt" | "updatedAt">;
  const rawMedia = Array.isArray(raw.media) ? (raw.media as Record<string, unknown>[]) : [];
  const media: ArtMedia[] = (v.media as unknown as { type: string; src: string; poster: string; preview: string }[])
    .slice(0, 20)
    .map((m, i) => ({
      type: VIDEO_EXT.test(m.src) || (m.type === "video" && !IMAGE_EXT.test(m.src)) ? ("video" as const) : ("image" as const),
      src: m.src,
      poster: m.poster,
      preview: m.preview,
      width: Math.max(0, Math.round(Number(rawMedia[i]?.width) || 0)),
      height: Math.max(0, Math.round(Number(rawMedia[i]?.height) || 0)),
    }))
    .filter((m) => m.src);
  const order = Number(raw.order);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(v.date) ? v.date : "";
  const now = new Date().toISOString();
  return {
    ...v,
    id: prev?.id || v.id || Math.random().toString(36).slice(2, 12),
    title: v.title,
    category: slugify(v.category || "reels"),
    media,
    date,
    order: Number.isFinite(order) ? Math.max(-9999, Math.min(9999, Math.round(order))) : 0,
    source: prev?.source || v.source || "admin",
    account: prev?.account ?? v.account,
    hashes: prev?.hashes ?? v.hashes,
    createdAt: prev?.createdAt || now,
    updatedAt: now,
  };
}
