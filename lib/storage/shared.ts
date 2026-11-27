import { seedContent } from "../seed";
import { CONTENT_VERSION, type SiteContent, type ViewStats } from "../types";

/** Merge stored content over the seed so newly added fields always have defaults. */
export function withDefaults(stored: Partial<SiteContent> | null | undefined): SiteContent {
  const seed = structuredClone(seedContent);
  const s = migrate(stored ?? {}, seed);
  return {
    ...seed,
    ...s,
    profile: { ...seed.profile, ...(s.profile ?? {}) },
    about: { ...seed.about, ...(s.about ?? {}) },
    hero: { ...seed.hero, ...(s.hero ?? {}) },
    events: { ...seed.events, ...(s.events ?? {}) },
    beyond: { ...seed.beyond, ...(s.beyond ?? {}) },
    art: { ...seed.art, ...(s.art ?? {}) },
    projects: (s.projects ?? seed.projects).map((p) => ({ ...p, role: p.role ?? "", overview: p.overview ?? "", architecture: p.architecture ?? "", challenges: p.challenges ?? "", demoVideo: p.demoVideo ?? "", demoPoster: p.demoPoster ?? "", demoCaption: p.demoCaption ?? "" })),
    seo: { ...seed.seo, ...(s.seo ?? {}) },
    theme: { ...seed.theme, ...(s.theme ?? {}) },
    contact: { ...seed.contact, ...(s.contact ?? {}) },
    sections: mergeSections(seed.sections, s.sections),
  } as SiteContent;
}

/**
 * Content saved before the old-portfolio redesign (version < 2) has a different shape for the
 * timeline, skills, films and hero. Use the seed for everything, but keep extra event photos
 * (e.g. the hidden ones uploaded to Blob) and an uploaded resume.
 */
export function migrate(stored: Partial<SiteContent>, seed: SiteContent): Partial<SiteContent> {
  if (!stored || Object.keys(stored).length === 0) return {};
  if (stored.version === CONTENT_VERSION) return stored;
  const extraPhotos = (stored.events?.photos ?? []).filter((p) => p?.id && !seed.events.photos.some((x) => x.id === p.id));
  const resumeUrl = stored.profile?.resumeUrl;
  return {
    ...structuredClone(seed),
    profile: { ...seed.profile, ...(resumeUrl ? { resumeUrl } : {}) },
    events: { ...seed.events, photos: [...seed.events.photos, ...extraPhotos] },
    version: CONTENT_VERSION,
  };
}

function mergeSections(seed: SiteContent["sections"], stored?: SiteContent["sections"]) {
  if (!Array.isArray(stored)) return seed;
  const known = new Set(stored.map((x) => x.id));
  return [...stored.filter((x) => seed.some((d) => d.id === x.id)), ...seed.filter((d) => !known.has(d.id))];
}

export function today(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function lastNDays(n: number) {
  const out: string[] = [];
  const now = Date.now();
  for (let i = n - 1; i >= 0; i--) out.push(today(new Date(now - i * 86400000)));
  return out;
}

export function buildStats(
  allDays: Record<string, { total: number; paths: Record<string, number> }>,
  n: number,
): ViewStats {
  const days = lastNDays(n).map((date) => ({ date, count: allDays[date]?.total ?? 0 }));
  let total = 0;
  const paths: Record<string, number> = {};
  for (const d of Object.values(allDays)) {
    total += d.total;
    for (const [p, c] of Object.entries(d.paths)) paths[p] = (paths[p] ?? 0) + c;
  }
  const topPaths = Object.entries(paths)
    .map(([path, count]) => ({ path: decodePathKey(path), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  return { total, days, topPaths };
}

/** MongoDB keys cannot contain "." or start with "$" */
export function encodePathKey(p: string) {
  return p.replace(/\./g, "%2E").replace(/^\$/, "%24");
}
export function decodePathKey(p: string) {
  return p.replace(/%2E/g, ".").replace(/^%24/, "$");
}

export function memoryPeek(key: string) {
  const cur = memHits.get(key);
  return cur && cur.reset > Date.now() ? cur.count : 0;
}

/** In-memory fixed-window counter (used by file + read-only stores) */
const memHits = new Map<string, { count: number; reset: number }>();
export function memoryHit(key: string, windowMs: number) {
  const now = Date.now();
  const cur = memHits.get(key);
  if (!cur || cur.reset <= now) {
    memHits.set(key, { count: 1, reset: now + windowMs });
    if (memHits.size > 5000) {
      for (const [k, v] of memHits) if (v.reset <= now) memHits.delete(k);
    }
    return 1;
  }
  cur.count += 1;
  return cur.count;
}
