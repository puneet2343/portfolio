import { ArrowUpRight, Download } from "lucide-react";
import { FooterSideLink } from "./FooterSideLink";
import type { SiteContent } from "@/lib/types";
import { SocialGlyph } from "./bits";
import { ContactForm } from "./ContactForm";
import { CopyEmail } from "./CopyEmail";

function splitHeading(h: string) {
  const words = h.trim().split(/\s+/);
  if (words.length < 2) return { first: "", last: h };
  return { first: words.slice(0, -1).join(" "), last: words[words.length - 1] };
}

export function Contact({ c }: { c: SiteContent }) {
  const { first, last } = splitHeading(c.contact.heading || "Get in Touch");
  const email = c.profile.email;
  const links = c.social.filter((s) => s.icon !== "email");

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative bg-background text-foreground font-sans py-16 md:py-24 lg:py-32 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-20 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[140px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 id="contact-title" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground">
            {first} <br className="hidden sm:block" /> <span className="text-foreground/50">{last}.</span>
          </h2>
          <p className="mt-6 max-w-md text-base md:text-lg font-light leading-relaxed text-foreground/70">{c.contact.blurb}</p>

          <div className="mt-8 space-y-3">
            {email && (
              <div className="group relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl transition-colors hover:border-white/20 sm:flex-row sm:items-center sm:justify-between">
                <a href={`mailto:${email}`} className="flex min-h-11 min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-background/80">
                    <SocialGlyph icon="email" className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-mono uppercase tracking-wider text-foreground/50">Email</span>
                    <span className="block break-all text-sm font-medium text-foreground/90 group-hover:text-foreground">{email}</span>
                  </span>
                </a>
                <CopyEmail email={email} />
              </div>
            )}
            {links.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-[72px] items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl transition-colors hover:border-white/20"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-background/80">
                    <SocialGlyph icon={s.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-mono uppercase tracking-wider text-foreground/50">{s.label}</span>
                    <span className="block truncate text-sm font-medium text-foreground/90 group-hover:text-foreground">
                      {s.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                    </span>
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </a>
            ))}
            <a
              href={c.profile.resumeUrl}
              download
              className="group flex min-h-[72px] items-center justify-between gap-3 rounded-2xl border border-[#007acc]/30 bg-[#007acc]/10 p-4 backdrop-blur-xl transition-colors hover:bg-[#007acc]/20"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#007acc] text-[#fff]">
                  <Download className="h-[18px] w-[18px]" />
                </span>
                <span>
                  <span className="block text-[11px] font-mono uppercase tracking-wider text-foreground/50">Resume</span>
                  <span className="block text-sm font-medium text-foreground/90">Download PDF</span>
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-foreground/40 group-hover:text-foreground" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-7">{c.contact.formEnabled ? <ContactForm /> : null}</div>
      </div>
    </section>
  );
}

export function Footer({ c }: { c: SiteContent }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-white/10 bg-background text-foreground" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-2xl font-bold tracking-tighter">
            {c.profile.name}
            <span className="text-foreground/50">.</span>
          </p>
          <p className="mt-1 text-sm text-foreground/60">
            {c.profile.role} · {c.profile.company}
          </p>
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <ul className="flex flex-wrap gap-2">
            {c.social.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target={s.url.startsWith("http") ? "_blank" : undefined}
                  rel={s.url.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={s.label}
                  title={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground/70 transition hover:bg-white/10 hover:text-foreground"
                >
                  <SocialGlyph icon={s.icon} className="h-[18px] w-[18px]" />
                </a>
              </li>
            ))}
            <li>
              <FooterSideLink />
            </li>
          </ul>
          <p className="text-[11px] font-mono uppercase tracking-widest text-foreground/40">
            © {year} {c.profile.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
