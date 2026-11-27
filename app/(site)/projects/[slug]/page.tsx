import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bullets, Chips, Container, Photo, SocialGlyph } from "@/components/site/bits";
import { ProjectCover } from "@/components/site/ProjectCover";
import { Reveal } from "@/components/site/Reveal";
import { getPublicContent } from "@/lib/content";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const c = await getPublicContent();
  return c.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = await getPublicContent();
  const p = c.projects.find((x) => x.slug === slug);
  if (!p) return { title: "Project not found" };
  return {
    title: p.title,
    description: p.tagline,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: { title: `${p.title} · ${c.profile.name}`, description: p.tagline, type: "article" },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const c = await getPublicContent();
  const idx = c.projects.findIndex((x) => x.slug === slug);
  if (idx === -1) notFound();
  const p = c.projects[idx];
  const prev = c.projects[(idx - 1 + c.projects.length) % c.projects.length];
  const next = c.projects[(idx + 1) % c.projects.length];

  return (
    <article className="pt-24 pb-16 sm:pt-32">
      <Container>
        <Link href="/#projects" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-fg">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All projects
        </Link>

        <header className="mt-6 max-w-3xl">
          {p.context ? <p className="eyebrow">{p.context}</p> : null}
          <h1 className="mt-3 text-[2.6rem] leading-[1.05] font-medium sm:text-6xl">{p.title}</h1>
          <p className="mt-4 font-serif text-xl leading-snug text-muted sm:text-2xl">{p.tagline}</p>
          {p.liveUrl || p.repoUrl ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {p.liveUrl ? (
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 font-medium text-accent-ink transition hover:brightness-110"
                >
                  Visit live site <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              ) : null}
              {p.repoUrl ? (
                <a
                  href={p.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass inline-flex h-11 items-center gap-2 rounded-full px-5 font-medium"
                >
                  <SocialGlyph icon="github" className="h-4 w-4" /> Source code
                </a>
              ) : null}
            </div>
          ) : null}
        </header>

        <div className="glass mt-10 rounded-[1.8rem] p-2">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[1.4rem] bg-bg-2 sm:aspect-[2/1]">
            {p.cover ? (
              <Photo src={p.cover} alt={`${p.title} screenshot`} sizes="(min-width: 1152px) 1120px, 96vw" priority position="50% 0%" />
            ) : (
              <ProjectCover title={p.title} tech={p.tech} />
            )}
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-8">
            {p.problem ? (
              <Reveal>
                <h2 className="text-2xl font-medium sm:text-3xl">The problem</h2>
                <p className="mt-4 text-[1.08rem] leading-[1.75] text-muted">{p.problem}</p>
              </Reveal>
            ) : null}
            {p.built.length ? (
              <Reveal>
                <h2 className="text-2xl font-medium sm:text-3xl">What I built</h2>
                <div className="mt-5">
                  <Bullets items={p.built} />
                </div>
              </Reveal>
            ) : null}
            {p.impact.length ? (
              <Reveal>
                <h2 className="text-2xl font-medium sm:text-3xl">Result</h2>
                <ul className="mt-5 grid gap-3">
                  {p.impact.map((t, i) => (
                    <li key={i} className="glass flex gap-3 rounded-2xl p-4">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent-2" aria-hidden />
                      <span className="leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}
            {p.gallery.length ? (
              <Reveal>
                <h2 className="text-2xl font-medium sm:text-3xl">Screens</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {p.gallery.map((src, i) => (
                    <div key={i} className="glass rounded-[1.4rem] p-2">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-[1.05rem] bg-bg-2">
                        <Photo src={src} alt={`${p.title} screen ${i + 1}`} sizes="(min-width: 640px) 45vw, 94vw" position="50% 0%" />
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            ) : null}
          </div>

          <aside className="lg:col-span-4">
            <div className="glass rounded-[1.6rem] p-5 sm:p-6 lg:sticky lg:top-24">
              <dl className="space-y-5">
                {p.context ? (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-[0.12em] text-subtle">Context</dt>
                    <dd className="mt-1 font-medium">{p.context}</dd>
                  </div>
                ) : null}
                {p.period ? (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-[0.12em] text-subtle">When</dt>
                    <dd className="mt-1 font-medium">{p.period}</dd>
                  </div>
                ) : null}
                {p.tech.length ? (
                  <div>
                    <dt className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-subtle">Tech</dt>
                    <dd>
                      <Chips items={p.tech} />
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </aside>
        </div>

        {c.projects.length > 1 ? (
          <nav aria-label="More projects" className="mt-16 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
            <Link href={`/projects/${prev.slug}`} className="glass group rounded-2xl p-4 transition hover:bg-[var(--glass-strong)]">
              <span className="flex items-center gap-1.5 text-sm text-subtle">
                <ArrowLeft className="h-4 w-4" aria-hidden /> Previous
              </span>
              <span className="mt-1 block font-medium">{prev.title}</span>
            </Link>
            <Link
              href={`/projects/${next.slug}`}
              className="glass group rounded-2xl p-4 text-right transition hover:bg-[var(--glass-strong)]"
            >
              <span className="flex items-center justify-end gap-1.5 text-sm text-subtle">
                Next <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
              <span className="mt-1 block font-medium">{next.title}</span>
            </Link>
          </nav>
        ) : null}
      </Container>
    </article>
  );
}
