import type { ContentKey, SiteContent } from "./types";

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
      id: "s", company: "s", role: "s", start: "s", end: "s", location: "s", logo: "u", summary: "t",
      items: [{ title: "s", tech: SA, points: TA }], tech: SA, published: "b",
    },
  ],
  projects: [
    {
      id: "s", slug: "s", title: "s", tagline: "t", context: "s", period: "s", cover: "u", gallery: UA,
      liveUrl: "u", repoUrl: "u", tech: SA, problem: "t", built: TA, impact: TA, featured: "b", published: "b",
    },
  ],
  skills: [{ id: "s", name: "s", items: SA, published: "b" }],
  education: [
    {
      id: "s", school: "s", degree: "s", start: "s", end: "s", location: "s", grade: "s", logo: "u",
      highlights: TA, published: "b",
    },
  ],
  events: { heading: "s", intro: "t", photos: [{ id: "s", src: "u", alt: "s", caption: "s", published: "b" }] },
  beyond: { heading: "s", intro: "t", items: [{ id: "s", title: "s", subtitle: "s", tags: SA, image: "u", published: "b" }] },
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
const SECTIONS = new Set(["about", "experience", "projects", "skills", "education", "events", "beyond", "contact"]);

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
    for (const p of (v as unknown as SiteContent["beyond"]).items) if (!p.id) p.id = rid();
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
    if (!hex.test(t.accent)) t.accent = "#b2532e";
    if (!hex.test(t.accent2)) t.accent2 = "#4f6f52";
    if (t.defaultMode !== "dark") t.defaultMode = "light";
  }
  return v;
}
