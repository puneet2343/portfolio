"use client";

import { motion } from "motion/react";
import { ChevronDown, ChevronUp, Play, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CinemaItem } from "./ArtCinema";

const EASE = [0.22, 1, 0.36, 1] as const;

/* =====================================================================
   Theatre: full-screen, lights down, vertical swipe between pieces
   ===================================================================== */
function Slide({ item, active, near, muted, setMuted }: { item: CinemaItem; active: boolean; near: boolean; muted: boolean; setMuted: (m: boolean) => void }) {
  const [page, setPage] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Only the slide on screen plays; the rest rewind and wait.
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (active && i === page) {
        v.muted = muted;
        v.play()
          .then(() => setPaused(false))
          .catch(() => {
            v.muted = true;
            setMuted(true);
            void v.play().catch(() => setPaused(true));
          });
      } else {
        v.pause();
        if (!active) v.currentTime = 0;
      }
    });
  }, [active, page, muted, setMuted]);

  const toggle = (v: HTMLVideoElement | null) => {
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  return (
    <section aria-roledescription="slide" aria-label={item.title || "Untitled"} className="relative flex h-[100dvh] w-full snap-start snap-always items-center justify-center">
      <div
        ref={strip}
        onScroll={(e) => {
          const el = e.currentTarget;
          setPage(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto"
      >
        {item.media.map((m, i) => (
          <div key={i} className="flex h-full w-full shrink-0 snap-center items-center justify-center px-0 py-16 sm:px-16 md:py-20">
            {m.type === "video" ? (
              near ? (
                <video
                  ref={(el) => {
                    videos.current[i] = el;
                  }}
                  src={m.src}
                  poster={m.poster || item.thumb || undefined}
                  loop
                  playsInline
                  muted={muted}
                  preload={active ? "auto" : "metadata"}
                  onClick={(e) => toggle(e.currentTarget)}
                  onTimeUpdate={(e) => active && i === page && setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
                  className="max-h-full max-w-full cursor-pointer object-contain sm:rounded-lg"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.poster || item.thumb} alt="" className="max-h-full max-w-full object-contain sm:rounded-lg" />
              )
            ) : near ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.src} alt={item.title} decoding="async" className="max-h-full max-w-full object-contain sm:rounded-lg" />
            ) : null}
          </div>
        ))}
      </div>

      {paused && active && item.media[page]?.type === "video" ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40 backdrop-blur-md">
            <Play className="h-6 w-6 translate-x-0.5 fill-current" />
          </span>
        </span>
      ) : null}

      {item.media.length > 1 ? (
        <div className="absolute bottom-[4.5rem] left-1/2 flex -translate-x-1/2 gap-1.5 md:bottom-8">
          {item.media.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show ${i + 1} of ${item.media.length}`}
              onClick={() => strip.current?.scrollTo({ left: i * strip.current.clientWidth, behavior: "smooth" })}
              className="flex h-6 items-center px-0.5"
            >
              <span className={`block h-1 rounded-full transition-all duration-300 ${i === page ? "w-5 bg-white" : "w-1.5 bg-white/40"}`} />
            </button>
          ))}
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pt-16 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8">
        <p className="max-w-[75%] font-serif text-2xl leading-tight tracking-tight text-white sm:text-3xl">{item.title || "Untitled"}</p>
      </div>
      {active && item.media[page]?.type === "video" ? (
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
          <span className="block h-full origin-left bg-gradient-to-r from-amber-200 to-amber-500" style={{ transform: `scaleX(${progress})` }} />
        </span>
      ) : null}
    </section>
  );
}

export function Theatre({ items, start, onClose }: { items: CinemaItem[]; start: number; onClose: () => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(start);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = start * el.clientHeight;
    window.__lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      window.__lenis?.start();
    };
  }, [start]);

  const go = useCallback((i: number) => {
    const el = scroller.current;
    if (!el) return;
    const n = Math.max(0, Math.min(items.length - 1, i));
    el.scrollTo({ top: n * el.clientHeight, behavior: "smooth" });
  }, [items.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === "ArrowRight" && !e.shiftKey)) {
        e.preventDefault();
        go(active + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        go(active - 1);
      } else if (e.key === "m" || e.key === "M") setMuted((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go, onClose]);

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Theatre"
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="fixed inset-0 z-[90] bg-black text-white"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        className="h-full w-full"
      >
        <div
          ref={scroller}
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollTop / el.clientHeight);
            if (i !== active) setActive(i);
          }}
          className="no-scrollbar h-full w-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
        >
          {items.map((x, i) => (
            <Slide key={x.id} item={x} active={i === active} near={Math.abs(i - active) <= 1} muted={muted} setMuted={setMuted} />
          ))}
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-8 sm:px-6">
        <span className="font-mono text-xs tracking-[0.3em] text-white/60">
          {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
        <div className="pointer-events-auto flex gap-2">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Sound on" : "Sound off"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition hover:bg-white/20"
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <button type="button" onClick={onClose} aria-label="Close theatre" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {items.length > 1 ? (
        <div className="absolute top-1/2 right-4 hidden -translate-y-1/2 flex-col gap-2 md:flex">
          <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition hover:bg-white/20 disabled:opacity-30">
            <ChevronUp className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => go(active + 1)} disabled={active === items.length - 1} aria-label="Next" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition hover:bg-white/20 disabled:opacity-30">
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      ) : null}
    </motion.div>,
    document.body,
  );
}

