import type { ReactNode } from "react";
import {
  About,
  Contact,
  EducationSection,
  EventsSection,
  Films,
  Hero,
  Projects,
  Skills,
  Work,
} from "@/components/site/sections";
import { getPublicContent, siteUrl } from "@/lib/content";
import type { SectionId, SiteContent } from "@/lib/types";

export const revalidate = 3600;

const RENDER: Record<SectionId, (c: SiteContent) => ReactNode> = {
  about: (c) => <About c={c} />,
  experience: (c) => (c.experience.length ? <Work c={c} /> : null),
  projects: (c) => (c.projects.length ? <Projects c={c} /> : null),
  skills: (c) => (c.skills.length ? <Skills c={c} /> : null),
  education: (c) => (c.education.length ? <EducationSection c={c} /> : null),
  events: (c) => <EventsSection c={c} />,
  beyond: (c) => <Films c={c} />,
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
    worksFor: c.profile.company ? { "@type": "Organization", name: c.profile.company } : undefined,
    address: c.profile.location ? { "@type": "PostalAddress", addressLocality: c.profile.location } : undefined,
    alumniOf: c.education[0] ? { "@type": "CollegeOrUniversity", name: c.education[0].school } : undefined,
    url,
    image: c.profile.avatarUrl ? new URL(c.profile.avatarUrl, url).toString() : undefined,
    sameAs: c.social.filter((s) => s.url.startsWith("http")).map((s) => s.url),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero c={c} />
      {c.sections.filter((s) => s.visible).map((s) => (
        <div key={s.id}>{RENDER[s.id]?.(c)}</div>
      ))}
    </>
  );
}
