"use client";

import { Briefcase, Download, FolderGit2, Mail, User, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export type NavItem = { id: string; label: string };

const ICONS: Record<string, typeof User> = {
  about: User,
  experience: Briefcase,
  projects: FolderGit2,
  skills: Wrench,
  contact: Mail,
};

export function Header({ name, nav, resumeUrl }: { name: string; nav: NavItem[]; resumeUrl: string }) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      if (window.scrollY < 240) setActive("");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!onHome) return;
    const els = nav.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [nav, onHome]);

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);
  const dock = nav.filter((n) => ICONS[n.id]).slice(0, 5);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>

      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
        <div
          className={`mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full pl-5 pr-2 transition-all duration-300 ${
            scrolled ? "glass" : "border border-transparent"
          }`}
        >
          <Link href="/" className="font-serif text-lg font-medium tracking-tight" aria-label={`${name}, home`}>
            {name}
          </Link>

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {nav.map((n) => (
                <li key={n.id}>
                  <a
                    href={href(n.id)}
                    aria-current={active === n.id ? "true" : undefined}
                    className={`rounded-full px-3.5 py-2 text-[0.94rem] transition-colors ${
                      active === n.id ? "bg-accent-soft text-fg" : "text-muted hover:text-fg"
                    }`}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {resumeUrl ? (
              <a
                href={resumeUrl}
                download
                className="inline-flex h-10 items-center gap-2 rounded-full bg-fg px-4 text-sm font-medium text-bg transition hover:opacity-90"
              >
                <Download className="h-4 w-4" aria-hidden />
                <span>Resume</span>
              </a>
            ) : null}
          </div>
        </div>
      </header>

      {/* Thumb-friendly dock on phones */}
      {dock.length > 0 ? (
        <nav
          aria-label="Sections"
          className="fixed inset-x-0 bottom-0 z-50 px-3 md:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <ul className="glass glass-strong mx-auto flex max-w-md items-stretch justify-between rounded-[22px] p-1.5">
            {dock.map((n) => {
              const Icon = ICONS[n.id];
              const on = active === n.id;
              return (
                <li key={n.id} className="flex-1">
                  <a
                    href={href(n.id)}
                    aria-current={on ? "true" : undefined}
                    className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[0.7rem] font-medium transition-colors ${
                      on ? "bg-accent-soft text-fg" : "text-muted"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden />
                    {n.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </>
  );
}
