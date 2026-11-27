"use client";

import { AnimatePresence, motion } from "motion/react";
import { BriefcaseBusiness, Clapperboard, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

export type SiteMode = "pro" | "art";

export const modeOf = (pathname: string): SiteMode => (pathname === "/art" || pathname.startsWith("/art/") ? "art" : "pro");

const OPTIONS = [
  { id: "pro" as const, href: "/", label: "Work", Icon: BriefcaseBusiness, hint: "Back to my work", toast: "Work mode: projects & experience" },
  { id: "art" as const, href: "/art", label: "Art", Icon: Clapperboard, hint: "Switch to my art & films", toast: "Art mode: films & photography" },
];
const HINT_KEY = "art-hint-seen";
const SPRING = { type: "spring", stiffness: 520, damping: 38, mass: 0.7 } as const;

/**
 * "Work | Art" segmented control. The thumb slides right away, a short toast names the side, and the
 * page follows. Nothing is remembered: "/" is always the work side. First-time visitors get a one-off hint.
 */
export function ModeSwitch() {
  const pathname = usePathname();
  const router = useRouter();
  const routeMode = modeOf(pathname);
  const [mode, setMode] = useState<SiteMode>(routeMode);
  const [, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [hint, setHint] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prev = useRef(routeMode);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setMode(routeMode);
    if (prev.current !== routeMode) {
      prev.current = routeMode;
      window.__lenis?.scrollTo(0, { immediate: true, force: true });
    }
  }, [routeMode]);

  useEffect(() => {
    router.prefetch(routeMode === "art" ? "/" : "/art");
  }, [router, routeMode]);

  // One-time coach mark for first visits on the work side.
  useEffect(() => {
    if (routeMode !== "pro") return;
    let seen = true;
    try {
      seen = localStorage.getItem(HINT_KEY) === "1";
    } catch {
      /* private mode: skip the hint */
    }
    if (seen) return;
    const show = setTimeout(() => {
      const r = ref.current?.getBoundingClientRect();
      if (!r || r.width === 0) return;
      setHint({ top: r.bottom + 12, right: Math.max(12, window.innerWidth - r.right) });
      try {
        localStorage.setItem(HINT_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 2000);
    const hide = setTimeout(() => setHint(null), 8000);
    const onScroll = () => window.scrollY > 120 && setHint(null);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
      window.removeEventListener("scroll", onScroll);
    };
  }, [routeMode]);

  function go(o: (typeof OPTIONS)[number]) {
    setHint(null);
    if (mode === o.id && routeMode === o.id) {
      if (window.__lenis) window.__lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setMode(o.id);
    setToast(o.toast);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
    // Let the thumb glide first, then the page cross-fades (view transition).
    window.setTimeout(() => startTransition(() => router.push(o.href)), 200);
  }

  return (
    <>
      <div
        ref={ref}
        role="radiogroup"
        aria-label="Portfolio side"
        className="relative inline-flex shrink-0 items-center rounded-full border border-foreground/10 bg-foreground/[0.06] p-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
      >
        {OPTIONS.map((o) => {
          const on = mode === o.id;
          return (
            <Link
              key={o.id}
              href={o.href}
              role="radio"
              aria-checked={on}
              aria-label={`${o.label}: ${o.hint}`}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                go(o);
              }}
              className={`group/seg relative z-0 flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold tracking-tight transition-colors duration-300 min-[360px]:px-3.5 ${
                on ? "text-background" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="mode-thumb"
                  className="absolute inset-0 -z-10 rounded-full bg-foreground shadow-[0_2px_8px_rgba(0,0,0,0.18),0_1px_2px_rgba(0,0,0,0.12)]"
                  transition={SPRING}
                />
              )}
              <o.Icon className="hidden h-3.5 w-3.5 min-[360px]:block" strokeWidth={2.2} aria-hidden />
              {o.label}
              {/* Desktop helper label */}
              {!on ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-[calc(100%+10px)] left-1/2 hidden -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full bg-foreground px-3 py-1.5 text-[11px] font-medium text-background opacity-0 shadow-lg transition-all duration-200 [@media(hover:hover)]:block group-hover/seg:translate-y-0 group-hover/seg:opacity-100"
                >
                  {o.hint}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      {mounted
        ? createPortal(
            <>
              <AnimatePresence>
                {hint ? (
                  <motion.button
                    key="hint"
                    type="button"
                    onClick={() => {
                      setHint(null);
                      go(OPTIONS[1]);
                    }}
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    style={{ top: hint.top, right: hint.right }}
                    className="fixed z-[75] flex max-w-[calc(100vw-24px)] items-center gap-2 rounded-2xl bg-[#1d1d1f] py-2.5 pr-2.5 pl-4 text-left text-[13px] font-medium text-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.45)]"
                  >
                    <span aria-hidden className="absolute -top-1.5 right-10 h-3 w-3 rotate-45 rounded-[2px] bg-[#1d1d1f]" />
                    {/* Text drawn with CSS content so this late pop-up never counts as the page's main paint (LCP). */}
                    <span className="relative" aria-label="New: see my films and photography">
                      <span aria-hidden className="mr-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black before:content-['New']" />
                      <span aria-hidden className="before:content-['See_my_films_&_photography_→']" />
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="Dismiss"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHint(null);
                      }}
                      className="relative flex h-7 w-7 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </span>
                  </motion.button>
                ) : null}
              </AnimatePresence>
              <AnimatePresence>
                {toast ? (
                  <motion.div
                    key={toast}
                    role="status"
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="pointer-events-none fixed inset-x-0 bottom-[max(24px,env(safe-area-inset-bottom))] z-[95] mx-auto w-fit rounded-full bg-[#1d1d1f]/90 px-5 py-3 text-[13px] font-semibold text-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md"
                  >
                    {toast}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
