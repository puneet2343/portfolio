import type { TimelineData } from "@/components/site/Journey";
import type { ProjectCardData } from "@/components/site/Projects";
import type { SectionId, SiteContent } from "./types";

/** DOM ids of the home-page sections (used by the header and anchors). */
export const SECTION_DOM_ID: Partial<Record<SectionId, string>> = {
  experience: "journey",
  skills: "ecosystem",
  projects: "projects",
  events: "events",
  contact: "contact",
};

export function navItems(c: SiteContent) {
  return c.sections
    .filter((s) => s.visible && SECTION_DOM_ID[s.id])
    .filter((s) => {
      if (s.id === "experience") return c.experience.length + c.education.length > 0;
      if (s.id === "skills") return c.skills.length > 0;
      if (s.id === "projects") return c.projects.length > 0;
      if (s.id === "events") return c.events.photos.length > 0;
      return true;
    })
    .map((s) => ({ id: SECTION_DOM_ID[s.id] as string, label: s.label }));
}

/** Header links on the Art side (/art). */
export function artNavItems(c: SiteContent) {
  return [{ id: "gallery", label: c.art.galleryHeading || "Gallery" }, ...(c.beyond.items.length ? [{ id: "films", label: "Films" }] : [])];
}

const period = (a: string, b: string) => [a, b].filter(Boolean).join(" - ");

export function timeline(c: SiteContent): TimelineData[] {
  return [
    ...c.experience.map((x) => ({
      id: x.id,
      role: x.role,
      company: x.company,
      period: period(x.start, x.end),
      location: x.location,
      logo: x.logo,
      type: x.type || "Full-time",
      description: x.summary,
      points: x.points,
      tech: x.tech,
    })),
    ...c.education.map((e) => ({
      id: e.id,
      role: e.degree,
      company: e.school,
      period: period(e.start, e.end),
      location: e.location,
      logo: e.logo,
      type: "Education",
      description: [e.summary, e.grade].filter(Boolean).join(" · "),
      points: e.highlights,
      tech: e.tags,
    })),
  ];
}

export function projectCards(c: SiteContent): ProjectCardData[] {
  return c.projects.map((p) => ({
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
    context: p.context,
    images: [p.cover, ...p.gallery].filter(Boolean),
    imageAlt: `${p.title} screenshot`,
    url: p.liveUrl,
    github: p.repoUrl,
    problem: p.problem,
    built: p.built,
    impact: p.impact,
    technologies: p.tech,
    demo: p.demoVideo ? { src: p.demoVideo, poster: p.demoPoster, caption: p.demoCaption } : undefined,
  }));
}

export const COMPANIES = {
  ssi: { name: "SS Innovations", logo: "/images/logos/ssi.jpeg" },
  medanta: { name: "Medanta", logo: "/images/logos/medanta.png" },
  gla: { name: "GLA University", logo: "/images/logos/gla.jpeg" },
};
