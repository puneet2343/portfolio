import "server-only";
import { cache } from "react";
import { getStore } from "./storage";
import type { SiteContent } from "./types";

export const getContent = cache(async (): Promise<SiteContent> => {
  const store = await getStore();
  return store.getContent();
});

/** Content with unpublished drafts and hidden items removed. */
export const getPublicContent = cache(async (): Promise<SiteContent> => {
  const c = await getContent();
  return {
    ...c,
    experience: c.experience.filter((x) => x.published),
    projects: c.projects.filter((x) => x.published),
    skills: c.skills.filter((x) => x.published && x.items.length > 0),
    education: c.education.filter((x) => x.published),
    events: { ...c.events, photos: c.events.photos.filter((x) => x.published && x.src) },
    beyond: { ...c.beyond, items: c.beyond.items.filter((x) => x.published) },
    social: c.social.filter((x) => x.published && x.url),
  };
});

export function siteUrl(c: SiteContent) {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  const url = c.seo.siteUrl || fromEnv || "http://localhost:3000";
  return url.replace(/\/+$/, "");
}

export function isVisible(c: SiteContent, id: SiteContent["sections"][number]["id"]) {
  return c.sections.find((s) => s.id === id)?.visible ?? false;
}
