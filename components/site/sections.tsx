import { ArrowRight, ArrowUpRight, Download, MapPin } from "lucide-react";
import Link from "next/link";
import type { SiteContent } from "@/lib/types";
import { Bullets, Chips, Container, Photo, Section, SocialGlyph } from "./bits";
import { ContactForm } from "./ContactForm";
import { CopyEmail } from "./CopyEmail";
import { ProjectCover } from "./ProjectCover";
import { Reveal } from "./Reveal";

const label = (c: SiteContent, id: string, fallback: string) => c.sections.find((s) => s.id === id)?.label || fallback;

/* ------------------------------ Hero ------------------------------ */
export function Hero({ c }: { c: SiteContent }) {
  const p = c.profile;
  const hasProjects = c.sections.some((s) => s.id === "projects" && s.visible) && c.projects.length > 0;
  const hasContact = c.sections.some((s) => s.id === "contact" && s.visible);
  return (
    <section aria-labelledby="hero-title" className="pt-28 pb-12 sm:pt-36 sm:pb-20">
      <Container className="grid items-center gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          {p.badge ? (
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-[var(--glass-strong)] px-3.5 py-1.5 text-sm text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-2" aria-hidden />
              {p.badge}
            </p>
          ) : null}
          <h1 id="hero-title" className="text-[3rem] leading-[1.02] font-medium sm:text-7xl">
            {p.name}
          </h1>
          <p className="mt-5 max-w-xl font-serif text-[1.45rem] leading-snug text-fg sm:text-[1.9rem]">{p.headline}</p>
          <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-muted">{p.pitch}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {hasProjects ? (
              <a
                href="#projects"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 font-medium text-accent-ink shadow-[0_8px_20px_-8px_var(--accent)] transition hover:brightness-110"
              >
                View work <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            ) : null}
            {hasContact ? (
              <a href="#contact" className="glass inline-flex h-12 items-center rounded-full px-6 font-medium transition hover:bg-[var(--glass-strong)]">
                Contact
              </a>
            ) : null}
            {p.resumeUrl ? (
              <a
                href={p.resumeUrl}
                download
                className="glass hidden h-12 items-center gap-2 rounded-full px-6 font-medium transition hover:bg-[var(--glass-strong)] sm:inline-flex"
              >
                <Download className="h-4 w-4" aria-hidden /> Resume
              </a>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted">
            {p.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden /> {p.location}
              </span>
            ) : null}
            {c.social.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target={s.url.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition hover:text-fg"
              >
                <SocialGlyph icon={s.icon} className="h-4 w-4" />
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-5">
          <figure className="glass relative mx-auto max-w-[26rem] rounded-[2rem] p-2.5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-bg-2">
              {p.avatarUrl ? (
                <Photo
                  src={p.avatarUrl}
                  alt={p.avatarAlt || p.name}
                  sizes="(min-width: 768px) 26rem, 92vw"
                  priority
                  position="50% 20%"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-serif text-7xl text-subtle">
                  {p.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </div>
              )}
            </div>
            {p.company ? (
              <figcaption className="glass glass-strong absolute -bottom-4 left-6 rounded-2xl px-4 py-2.5 text-sm">
                <span className="block font-medium">{p.role}</span>
                <span className="text-muted">{p.company}</span>
              </figcaption>
            ) : null}
          </figure>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------ About ------------------------------ */
export function About({ c }: { c: SiteContent }) {
  const a = c.about;
  return (
    <Section id="about" title={a.heading || label(c, "about", "About")}>
      <div className="grid gap-10 md:grid-cols-12 md:gap-14">
        {c.profile.aboutPhotoUrl ? (
          <Reveal className="md:col-span-5">
            <div className="glass mx-auto max-w-sm rounded-[1.8rem] p-2 md:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-bg-2">
                <Photo
                  src={c.profile.aboutPhotoUrl}
                  alt={c.profile.aboutPhotoAlt || c.profile.name}
                  sizes="(min-width: 768px) 40vw, 90vw"
                  position="50% 30%"
                />
              </div>
            </div>
          </Reveal>
        ) : null}
        <Reveal className={c.profile.aboutPhotoUrl ? "md:col-span-7" : "md:col-span-12"} delay={0.05}>
          <div className="space-y-5 text-[1.08rem] leading-[1.75] text-muted">
            {a.paragraphs.map((t, i) => (
              <p key={i} className={i === 0 ? "text-fg" : undefined}>
                {t}
              </p>
            ))}
          </div>
          {a.facts.length ? (
            <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {a.facts.map((f) => (
                <div key={f.label} className="glass rounded-2xl px-4 py-3.5">
                  <dt className="text-xs font-medium uppercase tracking-[0.12em] text-subtle">{f.label}</dt>
                  <dd className="mt-1 font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------ Work ------------------------------ */
export function Work({ c }: { c: SiteContent }) {
  const p = c.profile;
  return (
    <Section id="experience" title={label(c, "experience", "Work")}>
      {p.workPhotoUrl ? (
        <Reveal>
          <figure className="glass mb-10 rounded-[1.8rem] p-2">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.4rem] bg-bg-2 sm:aspect-[21/9]">
              <Photo src={p.workPhotoUrl} alt={p.workPhotoAlt} sizes="(min-width: 1152px) 1120px, 96vw" position="70% 45%" />
            </div>
            {p.workPhotoAlt ? <figcaption className="px-3 pt-2.5 pb-1 text-sm text-muted">{p.workPhotoAlt}</figcaption> : null}
          </figure>
        </Reveal>
      ) : null}

      <ol className="relative space-y-6 sm:space-y-8">
        {c.experience.map((e) => (
          <Reveal as="li" key={e.id}>
            <article className="glass rounded-[1.6rem] p-5 sm:p-8">
              <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  {e.logo ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line bg-white">
                      <Photo src={e.logo} alt="" sizes="48px" className="!object-contain p-1" />
                    </div>
                  ) : null}
                  <div>
                    <h3 className="text-xl leading-snug font-medium sm:text-2xl">{e.role}</h3>
                    <p className="mt-0.5 text-muted">
                      {e.company}
                      {e.location ? <span className="text-subtle"> · {e.location}</span> : null}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-medium text-muted sm:pt-1.5">
                  <time>{e.start}</time> – <time>{e.end}</time>
                </p>
              </header>
              {e.summary ? <p className="mt-5 leading-relaxed">{e.summary}</p> : null}

              {e.items.length ? (
                <div className="mt-6 grid gap-4">
                  {e.items.map((it, i) => (
                    <div key={i} className="rounded-2xl border border-line bg-[var(--glass)] p-4 sm:p-5">
                      <div className="mb-3 flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                        <h4 className="font-semibold">{it.title}</h4>
                        {it.tech.length ? <Chips items={it.tech} /> : null}
                      </div>
                      <Bullets items={it.points} />
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

/* ------------------------------ Projects ------------------------------ */
export function Projects({ c }: { c: SiteContent }) {
  const featured = c.projects.filter((p) => p.featured);
  const rest = c.projects.filter((p) => !p.featured);
  return (
    <Section id="projects" title={label(c, "projects", "Projects")}>
      <div className="grid gap-6 md:grid-cols-2">
        {featured.map((p, i) => (
          <Reveal as="article" key={p.id} delay={(i % 2) * 0.06} className="glass group relative flex flex-col overflow-hidden rounded-[1.6rem]">
            <div className="relative m-2 mb-0 aspect-[16/10] overflow-hidden rounded-[1.25rem] bg-bg-2">
              {p.cover ? (
                <Photo
                  src={p.cover}
                  alt=""
                  sizes="(min-width: 768px) 560px, 94vw"
                  className="transition duration-500 group-hover:scale-[1.025]"
                  position="50% 0%"
                />
              ) : (
                <ProjectCover title={p.title} tech={p.tech} />
              )}
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              {p.context ? <p className="text-sm text-subtle">{p.context}</p> : null}
              <h3 className="mt-1 text-2xl font-medium">
                <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0 after:content-['']">
                  {p.title}
                </Link>
              </h3>
              <p className="mt-2 leading-relaxed text-muted">{p.tagline}</p>
              <div className="mt-4">
                <Chips items={p.tech} max={4} />
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 pt-6 text-sm font-medium">
                <span className="inline-flex items-center gap-1.5 text-accent">
                  Read case study <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                </span>
                {p.liveUrl ? (
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 inline-flex items-center gap-1 rounded-full px-2 py-1 text-muted transition hover:text-fg"
                    aria-label={`${p.title} live site (opens in a new tab)`}
                  >
                    Live site <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                ) : null}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {rest.length ? (
        <div className="mt-12">
          <h3 className="mb-4 text-xl font-medium">More projects</h3>
          <ul className="grid gap-3">
            {rest.map((p) => (
              <Reveal as="li" key={p.id}>
                <Link
                  href={`/projects/${p.slug}`}
                  className="glass group flex flex-col gap-3 rounded-2xl p-4 transition hover:bg-[var(--glass-strong)] sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {p.title}
                      {p.context ? <span className="font-normal text-subtle"> · {p.context}</span> : null}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">{p.tagline}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="hidden lg:block">
                      <Chips items={p.tech} max={3} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-accent transition group-hover:translate-x-0.5" aria-hidden />
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  );
}

/* ------------------------------ Skills ------------------------------ */
export function Skills({ c }: { c: SiteContent }) {
  return (
    <Section id="skills" title={label(c, "skills", "Skills")}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {c.skills.map((g, i) => (
          <Reveal key={g.id} delay={(i % 3) * 0.05} className="glass rounded-[1.4rem] p-5 sm:p-6">
            <h3 className="mb-4 text-lg font-medium">{g.name}</h3>
            <Chips items={g.items} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------ Education ------------------------------ */
export function EducationSection({ c }: { c: SiteContent }) {
  return (
    <Section id="education" title={label(c, "education", "Education")}>
      <div className="grid gap-4">
        {c.education.map((e) => (
          <Reveal key={e.id} className="glass flex flex-col gap-4 rounded-[1.6rem] p-5 sm:flex-row sm:items-start sm:p-7">
            {e.logo ? (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-white">
                <Photo src={e.logo} alt="" sizes="56px" className="!object-contain p-1" />
              </div>
            ) : null}
            <div className="flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="text-xl font-medium">{e.degree}</h3>
                <p className="text-sm font-medium text-muted">
                  {e.start} – {e.end}
                </p>
              </div>
              <p className="mt-1 text-muted">
                {e.school}
                {e.location ? <span className="text-subtle"> · {e.location}</span> : null}
              </p>
              {e.grade ? <p className="mt-3 inline-flex rounded-full bg-accent-soft px-3 py-1 text-sm font-medium">{e.grade}</p> : null}
              {e.highlights.length ? (
                <div className="mt-4">
                  <Bullets items={e.highlights} />
                </div>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------ Events ------------------------------ */
export function EventsSection({ c }: { c: SiteContent }) {
  const photos = c.events.photos;
  if (!photos.length) return null;
  return (
    <Section id="events" title={c.events.heading || label(c, "events", "Events")}>
      {c.events.intro ? <p className="-mt-4 mb-8 max-w-2xl text-[1.05rem] leading-relaxed text-muted">{c.events.intro}</p> : null}
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {photos.map((ph, i) => (
          <Reveal as="li" key={ph.id} delay={(i % 3) * 0.05} className="w-[78%] shrink-0 snap-center sm:w-auto">
            <figure className="glass rounded-[1.4rem] p-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.05rem] bg-bg-2">
                <Photo src={ph.src} alt={ph.alt || ph.caption} sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 78vw" />
              </div>
              {ph.caption ? <figcaption className="px-2 pt-2.5 pb-1 text-sm text-muted">{ph.caption}</figcaption> : null}
            </figure>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------ Films ------------------------------ */
export function Films({ c }: { c: SiteContent }) {
  const b = c.beyond;
  if (!b.items.length) return null;
  return (
    <Section id="beyond" title={b.heading || label(c, "beyond", "Films")}>
      {b.intro ? <p className="-mt-4 mb-8 max-w-2xl text-[1.05rem] leading-relaxed text-muted">{b.intro}</p> : null}
      <ol className="glass divide-y divide-[var(--line)] rounded-[1.6rem] px-5 sm:px-7">
        {b.items.map((f, i) => (
          <li key={f.id} className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:gap-6">
            <span className="font-serif text-sm text-subtle tabular-nums" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1">
              <p className="font-serif text-xl">{f.title}</p>
              <p className="text-muted">{f.subtitle}</p>
            </div>
            {f.tags.length ? <Chips items={f.tags} /> : null}
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ------------------------------ Contact ------------------------------ */
export function Contact({ c }: { c: SiteContent }) {
  const email = c.profile.email;
  return (
    <Section id="contact" title={c.contact.heading || label(c, "contact", "Contact")}>
      <div className="grid gap-8 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <p className="text-[1.08rem] leading-relaxed text-muted">{c.contact.blurb}</p>
          {email ? (
            <div className="mt-6">
              <a href={`mailto:${email}`} className="link-underline font-serif text-xl break-all sm:text-2xl">
                {email}
              </a>
              <div className="mt-3">
                <CopyEmail email={email} />
              </div>
            </div>
          ) : null}
          <ul className="mt-8 flex flex-wrap gap-2">
            {c.social
              .filter((s) => s.icon !== "email")
              .map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition hover:bg-[var(--glass-strong)]"
                  >
                    <SocialGlyph icon={s.icon} className="h-4 w-4" /> {s.label}
                  </a>
                </li>
              ))}
          </ul>
        </Reveal>
        {c.contact.formEnabled ? (
          <Reveal className="md:col-span-7" delay={0.05}>
            <ContactForm />
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}

/* ------------------------------ Footer ------------------------------ */
export function Footer({ c }: { c: SiteContent }) {
  return (
    <footer className="pb-28 md:pb-10">
      <Container>
        <div className="flex flex-col gap-4 border-t border-line pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {c.profile.name}
            {c.profile.location ? ` · ${c.profile.location}` : ""}
          </p>
          <ul className="flex flex-wrap items-center gap-4">
            {c.social.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target={s.url.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition hover:text-fg"
                >
                  <SocialGlyph icon={s.icon} className="h-4 w-4" /> {s.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#top" className="transition hover:text-fg">
                Back to top ↑
              </a>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
