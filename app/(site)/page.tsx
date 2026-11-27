import type { ReactNode } from "react";
import { Contact } from "@/components/site/Contact";
import Ecosystem from "@/components/site/Ecosystem";
import Events from "@/components/site/Events";
import { FilmsSection } from "@/components/site/FilmsSection";
import Hero from "@/components/site/Hero";
import Journey from "@/components/site/Journey";
import Projects from "@/components/site/Projects";
import { getPublicContent, siteUrl } from "@/lib/content";
import { COMPANIES, projectCards, timeline } from "@/lib/site-data";
import type { SectionId, SiteContent } from "@/lib/types";

export const revalidate = 3600;

const RENDER: Partial<Record<SectionId, (c: SiteContent) => ReactNode>> = {
  experience: (c) => {
    const items = timeline(c);
    return items.length ? <Journey items={items} subtitle="Engineering milestones and technical breakthroughs." /> : null;
  },
  skills: (c) => (c.skills.length ? <Ecosystem skills={c.skills} categories={c.skillCategories} companies={COMPANIES} /> : null),
  projects: (c) => (c.projects.length ? <Projects projects={projectCards(c)} /> : null),
  beyond: (c) => <FilmsSection c={c} />,
  events: (c) => <Events heading={c.events.heading} intro={c.events.intro} photos={c.events.photos} />,
  contact: (c) => <Contact c={c} />,
};

export default async function Home() {
  const c = await getPublicContent();
  const url = siteUrl(c);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: c.profile.name,
    jobTitle: c.profile.role,
    email: c.profile.email ? `mailto:${c.profile.email}` : undefined,
    worksFor: c.profile.company ? { "@type": "Organization", name: c.profile.company } : undefined,
    address: c.profile.location ? { "@type": "PostalAddress", addressLocality: c.profile.location } : undefined,
    alumniOf: c.education[0] ? { "@type": "CollegeOrUniversity", name: c.education[0].school } : undefined,
    url,
    sameAs: c.social.filter((s) => s.url.startsWith("http")).map((s) => s.url),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero
        name={c.profile.name}
        role={c.hero.role}
        company={c.hero.company}
        location={c.hero.location}
        hire={c.hero.hire}
        skills={c.hero.skills}
        readme={c.hero.readme}
        styles={c.hero.styles}
        resumeUrl={c.profile.resumeUrl}
      />
      {c.sections
        .filter((s) => s.visible)
        .map((s) => (
          <div key={s.id}>{RENDER[s.id]?.(c)}</div>
        ))}
    </>
  );
}
