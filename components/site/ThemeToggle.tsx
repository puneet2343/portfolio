"use client";

import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Mode = "dark" | "light";
const EVENT = "site-theme";

function current(): Mode {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function apply(mode: Mode, remember: boolean) {
  document.documentElement.setAttribute("data-theme", mode);
  if (remember) {
    try {
      localStorage.setItem("theme", mode);
    } catch {
      /* private mode */
    }
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: mode }));
}

/** Theme switch with a circular reveal from the button (View Transitions API, plain swap as fallback). */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<Mode>("dark");

  useEffect(() => {
    setMode(current());
    const onChange = (e: Event) => setMode((e as CustomEvent<Mode>).detail);
    window.addEventListener(EVENT, onChange);
    // Follow the system setting until the visitor picks a theme themselves.
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onSystem = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem("theme");
      } catch {
        /* ignore */
      }
      if (saved !== "dark" && saved !== "light" && document.documentElement.dataset.themeDefault === "system") {
        apply(mq.matches ? "light" : "dark", false);
      }
    };
    mq.addEventListener("change", onSystem);
    return () => {
      window.removeEventListener(EVENT, onChange);
      mq.removeEventListener("change", onSystem);
    };
  }, []);

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next: Mode = current() === "dark" ? "light" : "dark";
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || reduce) {
      apply(next, true);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const vt = doc.startViewTransition(() => apply(next, true));
    vt.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 650, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => undefined);
  }

  const label = mode === "dark" ? "Switch to light theme" : "Switch to dark theme";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`relative inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full text-foreground/80 transition-colors hover:bg-white/10 hover:text-foreground ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mode}
          initial={{ y: 14, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 90 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
          className="flex"
        >
          {mode === "dark" ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
