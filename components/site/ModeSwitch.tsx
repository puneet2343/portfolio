"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

export type SiteMode = "pro" | "art";

export const modeOf = (pathname: string): SiteMode => (pathname === "/art" || pathname.startsWith("/art/") ? "art" : "pro");

const OPTIONS: { id: SiteMode; href: string; label: string; short: string }[] = [
  { id: "pro", href: "/", label: "Professional", short: "Work" },
  { id: "art", href: "/art", label: "Art", short: "Art" },
];

/**
 * "Professional | Art" pill switch. The thumb slides right away; the route change follows.
 * Nothing is remembered: "/" is always the professional side.
 */
export function ModeSwitch({ layoutId, size = "sm", onSwitch }: { layoutId: string; size?: "sm" | "lg"; onSwitch?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const routeMode = modeOf(pathname);
  const [mode, setMode] = useState<SiteMode>(routeMode);
  const [, startTransition] = useTransition();

  const prev = useRef(routeMode);
  useEffect(() => {
    setMode(routeMode);
    if (prev.current !== routeMode) {
      prev.current = routeMode;
      // New side: start at the top (keep Lenis in sync with the native scroll position).
      window.__lenis?.scrollTo(0, { immediate: true, force: true });
    }
  }, [routeMode]);

  useEffect(() => {
    router.prefetch(routeMode === "art" ? "/" : "/art");
  }, [router, routeMode]);

  const lg = size === "lg";

  return (
    <div
      role="radiogroup"
      aria-label="Portfolio side"
      className={`relative inline-flex shrink-0 items-center rounded-full border border-white/10 bg-foreground/[0.06] p-1 ${lg ? "w-full" : ""}`}
    >
      {OPTIONS.map((o) => {
        const on = mode === o.id;
        return (
          <Link
            key={o.id}
            href={o.href}
            role="radio"
            aria-checked={on}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              onSwitch?.();
              if (mode === o.id && routeMode === o.id) {
                if (window.__lenis) window.__lenis.scrollTo(0);
                else window.scrollTo({ top: 0, behavior: "smooth" });
                return;
              }
              setMode(o.id);
              // Let the thumb glide first, then swap the page and start it at the top.
              window.setTimeout(() => startTransition(() => router.push(o.href)), 240);
            }}
            className={`relative z-0 flex items-center justify-center rounded-full font-semibold tracking-tight transition-colors duration-300 ${
              lg ? "h-12 flex-1 text-[15px]" : "h-9 px-3.5 text-[12.5px]"
            } ${on ? "text-background" : "text-foreground/60 hover:text-foreground"}`}
          >
            {on && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-full bg-foreground shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
                transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.8 }}
              />
            )}
            {lg ? (
              o.label
            ) : (
              <>
                <span className="hidden lg:inline">{o.label}</span>
                <span className="lg:hidden">{o.short}</span>
              </>
            )}
          </Link>
        );
      })}
    </div>
  );
}
