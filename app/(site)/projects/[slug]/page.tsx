import { ArrowLeft, ArrowRight, ArrowUpRight, Globe, Layers } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { Photo, SocialGlyph } from "@/components/site/bits";
import { DemoPlayer } from "@/components/site/DemoPlayer";
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

function Rule({ label, tone = "purple" }: { label: string; tone?: "purple" | "emerald" }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className={`h-px w-6 sm:w-8 ${tone === "purple" ? "bg-purple-500/50" : "bg-emerald-500/50"}`} />
      <h2 className={`text-[10px] font-bold uppercase tracking-[0.2em] shrink-0 ${tone === "purple" ? "text-purple-300" : "text-emerald-500"}`}>{label}</h2>
      <div className={`h-px flex-1 bg-gradient-to-r ${tone === "purple" ? "from-purple-500/20" : "from-emerald-500/20"} to-transparent`} />
    </div>
  );
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
    <ViewTransition enter="page" exit="page" default="none">
    <article className="relative bg-background text-foreground font-sans pt-28 pb-16 sm:pt-36">
      <div aria-hidden className="pointer-events-none absolute -top-20 left-1/2 h-[420px] w-[620px] max-w-full -translate-x-1/2 rounded-full bg-[#007acc]/10 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/#projects"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-xs font-medium text-foreground/70 transition hover:bg-white/10 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> All projects
        </Link>

        <header className="mt-8 max-w-4xl">
          {p.context ? (
            <span className="inline-block rounded-full border border-foreground/10 bg-foreground/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/80 backdrop-blur-md">
              {p.context}
            </span>
          ) : null}
          <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.95]">
            {p.title}
            <span className="text-foreground/50">.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base sm:text-lg font-light leading-relaxed text-foreground/70">{p.tagline}</p>
          {p.liveUrl || p.repoUrl ? (
            <div className="mt-7 flex flex-wrap gap-3">
              {p.liveUrl ? (
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition hover:scale-[1.02]"
                >
                  <Globe className="h-4 w-4" aria-hidden /> Visit website <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              ) : null}
              {p.repoUrl ? (
                <a
                  href={p.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 text-sm font-semibold transition hover:bg-white/10"
                >
                  <SocialGlyph icon="github" className="h-4 w-4" /> Source code
                </a>
              ) : null}
            </div>
          ) : null}
        </header>

        {p.demoVideo ? (
          <figure className="mt-10">
            <DemoPlayer demo={{ src: p.demoVideo, poster: p.demoPoster || p.cover, caption: p.demoCaption }} title={p.title} />
            {p.demoCaption ? (
              <figcaption className="mt-3 flex items-center gap-2 text-xs text-foreground/55">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden /> {p.demoCaption}
              </figcaption>
            ) : null}
          </figure>
        ) : (
        <div className="relative mt-10 overflow-hidden rounded-2xl border border-foreground/20 shadow-[0_0_80px_-20px_rgba(255,255,255,0.05)]">
          <div className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-foreground/50 to-transparent" />
          <div className="relative aspect-[16/10] sm:aspect-[2/1] bg-foreground/[0.02]">
            {p.cover ? (
              <Photo src={p.cover} alt={`${p.title} screenshot`} sizes="(min-width: 1280px) 1216px, 96vw" priority position="50% 0%" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10">
                <Layers className="h-14 w-14 text-foreground/15" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/30">{p.tech.slice(0, 3).join(" • ")}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-60" />
          </div>
        </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="space-y-10 lg:col-span-3">
            {p.problem ? (
              <section className="space-y-5">
                <Rule label="The Problem" />
                <p className="text-base sm:text-lg font-light leading-relaxed text-foreground/80">{p.problem}</p>
              </section>
            ) : null}
            {p.overview ? (
              <section className="space-y-5">
                <Rule label="What I Built" />
                <p className="text-sm sm:text-base font-light leading-relaxed text-foreground/80">{p.overview}</p>
              </section>
            ) : null}
            {p.built.length ? (
              <section className="space-y-5">
                <Rule label="Core Initiatives" />
                <div className="space-y-4 sm:space-y-5">
                  {p.built.map((point, i) => (
                    <div key={i} className="flex gap-3 sm:gap-4">
                      <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/30" />
                      <p className="text-sm sm:text-base font-light leading-relaxed text-foreground/80">{point}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            {p.architecture ? (
              <section className="space-y-5">
                <Rule label="Architecture" />
                <p className="text-sm sm:text-base font-light leading-relaxed text-foreground/80">{p.architecture}</p>
              </section>
            ) : null}
            {p.challenges ? (
              <section className="space-y-5">
                <Rule label="Challenges" />
                <p className="text-sm sm:text-base font-light leading-relaxed text-foreground/80">{p.challenges}</p>
              </section>
            ) : null}
            {p.impact.length ? (
              <section className="space-y-5">
                <Rule label="Impact" tone="emerald" />
                <div className="space-y-4 sm:space-y-5">
                  {p.impact.map((point, i) => (
                    <div key={i} className="flex gap-3 sm:gap-4">
                      <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/60" />
                      <p className="text-sm sm:text-base font-light leading-relaxed text-foreground/80">{point}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            {p.gallery.length ? (
              <section className="space-y-5">
                <Rule label="Screens" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {p.gallery.map((src, i) => (
                    <div key={i} className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-foreground/10">
                      <Photo src={src} alt={`${p.title} screen ${i + 1}`} sizes="(min-width: 640px) 45vw, 94vw" position="50% 0%" />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="lg:col-span-2">
            <div className="space-y-6 rounded-2xl border border-foreground/5 bg-foreground/[0.02] p-5 sm:p-6 lg:sticky lg:top-28">
              <div>
                <h2 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-foreground/50">Technical Snapshot</h2>
                <div className="flex flex-wrap gap-2">
                  {p.tech.map((tech) => (
                    <span key={tech} className="rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-1.5 text-[10px] font-bold text-foreground/80">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              {p.role ? (
                <div className="border-t border-foreground/5 pt-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">My role</p>
                  <p className="mt-1 text-sm leading-relaxed">{p.role}</p>
                </div>
              ) : null}
              {p.period ? (
                <div className="border-t border-foreground/5 pt-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">When</p>
                  <p className="mt-1 text-sm">{p.period}</p>
                </div>
              ) : null}
              {p.liveUrl ? (
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-5 py-4 transition-all hover:bg-indigo-500/15"
                >
                  <span className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-indigo-400/70 group-hover/btn:text-indigo-400" />
                    <span className="text-sm font-semibold text-indigo-300/70 group-hover/btn:text-indigo-300">Visit website</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500/50">Live</span>
                </a>
              ) : null}
            </div>
          </aside>
        </div>

        {c.projects.length > 1 ? (
          <nav aria-label="More projects" className="mt-16 grid gap-3 border-t border-foreground/10 pt-8 sm:grid-cols-2">
            <Link href={`/projects/${prev.slug}`} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition hover:border-white/20">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Previous
              </span>
              <span className="mt-2 block text-lg font-bold tracking-tight">{prev.title}</span>
            </Link>
            <Link href={`/projects/${next.slug}`} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-right backdrop-blur-xl transition hover:border-white/20">
              <span className="flex items-center justify-end gap-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                Next <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="mt-2 block text-lg font-bold tracking-tight">{next.title}</span>
            </Link>
          </nav>
        ) : null}
      </div>
    </article>
    </ViewTransition>
  );
}
