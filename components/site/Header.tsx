"use client";

import { AnimatePresence, motion, useMotionValue, useScroll, useSpring } from "motion/react";
import { Download, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ModeSwitch, modeOf } from "./ModeSwitch";
import { scrollToId } from "./SmoothScroll";
import { ThemeToggle } from "./ThemeToggle";

export type NavItem = { id: string; label: string };

/** Small magnetic pull towards the pointer (desktop pointers only). */
function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 300, damping: 18, mass: 0.4 });
  return (
    <motion.span
      ref={ref}
      style={{ x: sx, y: sy }}
      className="inline-flex"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

export function Header({ name, nav: proNav, artNav, resumeUrl }: { name: string; nav: NavItem[]; artNav: NavItem[]; resumeUrl: string }) {
  const pathname = usePathname();
  const mode = modeOf(pathname);
  // Each side has its own base page and its own sections.
  const base = mode === "art" ? "/art" : "/";
  const nav = mode === "art" ? artNav : proNav;
  const onHome = pathname === base;
  const hrefOf = (id: string) => (id === "top" ? base : base === "/" ? `/#${id}` : `${base}#${id}`);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Which section is in the middle of the screen
  useEffect(() => {
    if (!onHome) {
      setActive(pathname.startsWith("/projects") ? "projects" : "");
      return;
    }
    const els = nav.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const onTop = () => {
      if (window.scrollY < window.innerHeight * 0.5) setActive("");
    };
    window.addEventListener("scroll", onTop, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onTop);
    };
  }, [onHome, nav, pathname]);

  // Lock the page behind the mobile menu
  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.__lenis?.start();
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function go(e: React.MouseEvent, id: string) {
    if (!onHome) return; // normal navigation to /#id
    e.preventDefault();
    setOpen(false);
    // let the menu close (and Lenis restart) before scrolling
    setTimeout(() => {
      if (scrollToId(id)) history.replaceState(null, "", hrefOf(id));
    }, open ? 120 : 0);
  }

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-3"
        style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
      >
        <motion.header
          style={{ viewTransitionName: "site-header" }}
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.1 }}
          className={`pointer-events-auto relative flex w-full items-center justify-between gap-1 rounded-full border border-white/10 bg-background/55 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl backdrop-saturate-150 transition-[max-width,padding,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            scrolled ? "max-w-[880px] bg-background/75 py-1 pl-1.5 pr-1.5" : "max-w-[1100px] py-1.5 pl-2 pr-2"
          }`}
        >
          {/* inner highlight */}
          <span aria-hidden className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <Link
            href={base}
            onClick={(e) => go(e, "top")}
            className="group flex min-h-11 shrink-0 items-center gap-2.5 rounded-full pl-1 pr-3"
            aria-label={`${name}, back to top`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#007acc] text-[11px] font-bold text-[#fff] shadow-[0_0_0_3px_rgba(0,122,204,0.18)] transition-transform duration-300 group-hover:scale-105">
              {initials}
            </span>
            <span className="hidden whitespace-nowrap text-sm font-semibold tracking-tight text-foreground min-[480px]:block md:hidden xl:block">
              {name}
            </span>
          </Link>

          <nav aria-label="Sections" className="hidden items-center md:flex">
            <ul className="flex items-center">
              {nav.map((n) => {
                const isActive = active === n.id;
                return (
                  <li key={n.id}>
                    <Magnetic>
                      <Link
                        href={hrefOf(n.id)}
                        onClick={(e) => go(e, n.id)}
                        aria-current={isActive ? "true" : undefined}
                        className={`relative flex h-11 items-center rounded-full px-3 text-[13px] font-medium transition-colors lg:px-4 ${
                          isActive ? "text-background" : "text-foreground/65 hover:text-foreground"
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute inset-0 rounded-full bg-foreground shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          />
                        )}
                        <span className="relative z-10">{n.label}</span>
                      </Link>
                    </Magnetic>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <ModeSwitch />
            <ThemeToggle />
            <Magnetic strength={0.25}>
              <a
                href={resumeUrl}
                download
                aria-label="Download resume"
                className="hidden h-11 items-center gap-2 rounded-full bg-foreground px-3.5 text-[13px] font-semibold text-background transition-transform hover:scale-[1.03] active:scale-95 sm:inline-flex lg:px-4"
              >
                <Download size={14} strokeWidth={2.5} aria-hidden /> <span className="md:max-lg:hidden">Resume</span>
              </a>
            </Magnetic>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-white/10 md:hidden"
            >
              <Menu size={20} aria-hidden />
            </button>
          </div>

          {/* scroll progress */}
          <motion.span
            aria-hidden
            style={{ scaleX: progress }}
            className="pointer-events-none absolute inset-x-5 bottom-0 h-[2px] origin-left rounded-full bg-gradient-to-r from-[#007acc] via-sky-400 to-emerald-400"
          />
        </motion.header>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.1 } }}
            className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-background/80 backdrop-blur-2xl backdrop-saturate-150 md:hidden"
            style={{
              paddingTop: "max(12px, env(safe-area-inset-top))",
              paddingBottom: "max(24px, env(safe-area-inset-bottom))",
            }}
          >
            <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#007acc]/20 blur-[100px]" />
            <div className="relative flex items-center justify-between px-5 pt-1.5">
              <span className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#007acc] text-[11px] font-bold text-[#fff]">{initials}</span>
                <span className="text-sm font-semibold">{name}</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5"
              >
                <X size={20} aria-hidden />
              </button>
            </div>

            <nav aria-label="Sections" className="relative flex flex-1 flex-col justify-center px-6 py-8">
              <motion.ul
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } }, hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } } }}
                className="space-y-1"
              >
                {[{ id: "top", label: "Home" }, ...nav].map((n, i) => (
                  <motion.li
                    key={n.id}
                    variants={{
                      hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
                      show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 260, damping: 24 } },
                    }}
                  >
                    <Link
                      href={hrefOf(n.id)}
                      onClick={(e) => {
                        if (!onHome) setOpen(false);
                        go(e, n.id);
                      }}
                      className={`group flex min-h-14 items-baseline gap-4 py-1 text-[clamp(2rem,10vw,3rem)] font-bold leading-tight tracking-tighter ${
                        active === n.id || (n.id === "top" && !active && onHome) ? "text-foreground" : "text-foreground/50"
                      }`}
                    >
                      <span className="font-mono text-xs font-normal tracking-widest text-foreground/40">0{i + 1}</span>
                      <span className="transition-transform duration-300 group-active:translate-x-1">{n.label}</span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.35 } }}
              exit={{ opacity: 0, y: 10 }}
              className="relative flex items-center justify-between gap-3 px-6"
            >
              <a
                href={resumeUrl}
                download
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background"
              >
                <Download size={16} aria-hidden /> Download Resume
              </a>
              <span className="rounded-full border border-white/10 bg-white/5">
                <ThemeToggle />
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
