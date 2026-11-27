"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clapperboard, Images, Play, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ArtCategory, ArtMedia } from "@/lib/types";
import { SocialGlyph } from "./bits";

export type CinemaItem = {
  id: string;
  title: string;
  category: string;
  media: ArtMedia[];
  thumb: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function posterOf(x: CinemaItem) {
  const m = x.media[0];
  return x.thumb || m?.poster || (m?.type === "image" ? m.src : "");
}
function ratioOf(m?: ArtMedia) {
  const r = m && m.width > 0 && m.height > 0 ? m.width / m.height : m?.type === "video" ? 9 / 16 : 4 / 5;
  return Math.min(1.78, Math.max(0.56, r));
}
const isVideo = (x: CinemaItem) => x.media[0]?.type === "video";

/* =====================================================================
   Hero reel: full-bleed muted loop, letterbox bars, grain, title card
   ===================================================================== */
export function HeroReel({
  kicker,
  heading,
  accent,
  intro,
  video,
  poster,
  onPlay,
  canPlay,
}: {
  kicker: string;
  heading: string;
  accent: string;
  intro: string;
  video: string;
  poster: string;
  onPlay: () => void;
  canPlay: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  // Muted autoplay, but not for visitors who asked for less motion; pause when off screen.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !reduce) void v.play().catch(() => undefined);
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section aria-labelledby="art-title" className="relative isolate flex h-[100svh] min-h-[540px] w-full items-end overflow-hidden bg-black text-white">
      {video ? (
        <video
          ref={ref}
          src={video}
          poster={poster || undefined}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          className="cinema-kenburns absolute inset-0 -z-20 h-full w-full object-cover"
        />
      ) : poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="cinema-kenburns absolute inset-0 -z-20 h-full w-full object-cover" />
      ) : null}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.75)_100%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/30 to-black/40" />
      <div aria-hidden className="film-grain pointer-events-none absolute inset-0 -z-10" />

      {/* Letterbox bars */}
      <motion.div aria-hidden initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1.4, ease: EASE, delay: 0.2 }} className="absolute inset-x-0 top-0 h-[6svh] origin-top bg-black md:h-[9svh]" />
      <motion.div aria-hidden initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1.4, ease: EASE, delay: 0.2 }} className="absolute inset-x-0 bottom-0 h-[6svh] origin-bottom bg-black md:h-[9svh]" />

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-[calc(6svh+2.5rem)] sm:px-8 md:pb-[calc(9svh+3rem)]">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.7 }}
          className="flex items-center gap-3 text-white/60"
        >
          <Clapperboard className="h-4 w-4" aria-hidden />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.4em]">{kicker}</span>
        </motion.p>
        <motion.h1
          id="art-title"
          initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.4, ease: EASE, delay: 0.85 }}
          className="mt-4 max-w-4xl font-serif text-[clamp(2.9rem,11vw,7.5rem)] leading-[0.9] tracking-tighter"
        >
          {heading} <br />
          <span className="film-accent bg-gradient-to-r from-amber-100 via-white to-amber-400 bg-clip-text text-transparent">{accent}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 1.2 }}
          className="mt-5 max-w-lg font-serif text-base italic leading-relaxed text-white/70 md:text-lg"
        >
          {intro}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 1.45 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          {canPlay ? (
            <button
              type="button"
              onClick={onPlay}
              className="inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-6 text-sm font-semibold text-black transition-transform hover:scale-[1.03] active:scale-95"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden /> Play reel
            </button>
          ) : null}
          <a
            href="#gallery"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            Browse the work <ChevronDown className="h-4 w-4" aria-hidden />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* =====================================================================
   Rows: one filmstrip per category, hover to preview
   ===================================================================== */
function Card({ item, onOpen }: { item: CinemaItem; onOpen: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);
  const m = item.media[0];
  const preview = m?.type === "video" ? m.preview || m.src : "";
  const poster = posterOf(item);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (hover) void v.play().catch(() => undefined);
    else {
      v.pause();
      v.currentTime = 0;
    }
  }, [hover]);

  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      aria-label={`Play ${item.title || "untitled"}`}
      className="film-card group relative h-full max-w-[80vw] shrink-0 snap-start overflow-hidden rounded-xl bg-white/[0.04] text-left ring-1 ring-white/10 transition-[opacity,filter,box-shadow,transform] duration-500 hover:ring-white/30 focus-visible:ring-white/60"
      style={{ aspectRatio: String(ratioOf(m)) }}
    >
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]" />
      ) : null}
      {preview && hover ? <video ref={ref} src={preview} muted loop playsInline preload="auto" aria-hidden className="absolute inset-0 h-full w-full object-cover" /> : null}
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
      {isVideo(item) || item.media.length > 1 ? (
        <span className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white/90 backdrop-blur-md">
          {item.media.length > 1 ? <Images className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3 w-3 translate-x-px fill-current" aria-hidden />}
        </span>
      ) : null}
      <span className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5">
        <span className="line-clamp-2 text-[13px] font-semibold leading-snug tracking-tight text-white sm:text-sm">{item.title || "Untitled"}</span>
      </span>
    </button>
  );
}

function Row({ label, items, onOpen, index }: { label: string; items: CinemaItem[]; onOpen: (i: number) => void; index: number }) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const update = useCallback(() => {
    const t = track.current;
    if (!t) return;
    setEdges({ start: t.scrollLeft < 8, end: t.scrollLeft + t.clientWidth > t.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);
  const by = (d: 1 | -1) => track.current?.scrollBy({ left: d * track.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay: Math.min(index, 3) * 0.05 }}
      className="relative"
    >
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-5 sm:px-8">
        <h3 className="flex items-baseline gap-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
          {label}
          <span className="font-mono text-[10px] font-normal tracking-widest text-white/40">{String(items.length).padStart(2, "0")}</span>
        </h3>
        <div className="hidden gap-2 md:flex">
          <button type="button" onClick={() => by(-1)} disabled={edges.start} aria-label={`Scroll ${label} left`} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15 disabled:opacity-30">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => by(1)} disabled={edges.end} aria-label={`Scroll ${label} right`} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15 disabled:opacity-30">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div
        ref={track}
        onScroll={update}
        className="film-row no-scrollbar mt-4 flex h-[clamp(220px,52vw,300px)] snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-5 pb-1 scroll-px-5 sm:gap-4 sm:px-8 sm:scroll-px-8 md:h-[320px] lg:h-[360px] xl:px-[max(2rem,calc((100vw-80rem)/2+2rem))] xl:scroll-px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
      >
        {items.map((x, i) => (
          <Card key={x.id} item={x} onOpen={() => onOpen(i)} />
        ))}
        <span aria-hidden className="w-1 shrink-0" />
      </div>
    </motion.div>
  );
}

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

/* =====================================================================
   Page body: hero + rows + theatre wiring
   ===================================================================== */
export function ArtCinema({
  kicker,
  heading,
  accent,
  intro,
  heroVideo,
  heroPoster,
  galleryHeading,
  galleryIntro,
  instagramUrl,
  categories,
  items,
}: {
  kicker: string;
  heading: string;
  accent: string;
  intro: string;
  heroVideo: string;
  heroPoster: string;
  galleryHeading: string;
  galleryIntro: string;
  instagramUrl: string;
  categories: ArtCategory[];
  items: CinemaItem[];
}) {
  const [theatre, setTheatre] = useState<{ list: CinemaItem[]; start: number } | null>(null);

  const rows = useMemo(() => {
    const known = categories.map((c) => ({ ...c, items: items.filter((x) => x.category === c.id) }));
    const other = items.filter((x) => !categories.some((c) => c.id === x.category));
    return [...known, ...(other.length ? [{ id: "more", label: "More", items: other }] : [])].filter((r) => r.items.length);
  }, [categories, items]);

  // "Play reel": every video in row order, or the hero clip when there is nothing else yet.
  const reel = useMemo(() => {
    const vids = rows.flatMap((r) => r.items).filter(isVideo);
    if (vids.length) return vids;
    return heroVideo ? [{ id: "hero", title: `${heading} ${accent}`.trim(), category: "", thumb: heroPoster, media: [{ type: "video" as const, src: heroVideo, poster: heroPoster, width: 1920, height: 1080 }] }] : [];
  }, [rows, heroVideo, heroPoster, heading, accent]);

  return (
    <>
      <HeroReel kicker={kicker} heading={heading} accent={accent} intro={intro} video={heroVideo} poster={heroPoster} canPlay={reel.length > 0} onPlay={() => setTheatre({ list: reel, start: 0 })} />

      <section id="gallery" aria-labelledby="gallery-title" className="relative overflow-hidden bg-black py-16 text-white md:py-24">
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/4 h-[420px] w-[520px] rounded-full bg-amber-500/[0.06] blur-[140px]" />
        <div className="relative mx-auto mb-10 flex max-w-7xl flex-col justify-between gap-6 px-5 sm:px-8 md:mb-14 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-amber-200/70">Now showing</p>
            <h2 id="gallery-title" className="mt-3 text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              {galleryHeading || "Gallery"}
              <span className="text-white/40">.</span>
            </h2>
            {galleryIntro ? <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">{galleryIntro}</p> : null}
          </div>
          {rows.length > 1 ? (
            <nav aria-label="Jump to a row" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:justify-end md:px-0">
              {rows.map((r) => (
                <a key={r.id} href={`#row-${r.id}`} className="inline-flex h-10 shrink-0 items-center rounded-full border border-white/15 bg-white/5 px-4 text-[13px] font-medium text-white/75 transition hover:bg-white/15 hover:text-white">
                  {r.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>

        {rows.length ? (
          <div className="space-y-12 md:space-y-16">
            {rows.map((r, ri) => (
              <div key={r.id} id={`row-${r.id}`} className="scroll-mt-24">
                <Row label={r.label} items={r.items} index={ri} onOpen={(i) => setTheatre({ list: r.items, start: i })} />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center sm:py-24">
              <div aria-hidden className="film-grain pointer-events-none absolute inset-0 opacity-60" />
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Coming soon</p>
              <p className="mt-4 font-serif text-2xl tracking-tight sm:text-3xl">New reels are being cut.</p>
              {instagramUrl ? (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition-transform hover:scale-[1.03]">
                  <SocialGlyph icon="instagram" className="h-4 w-4" /> Watch on Instagram
                </a>
              ) : null}
            </div>
          </div>
        )}
      </section>

      <AnimatePresence>{theatre ? <Theatre items={theatre.list} start={theatre.start} onClose={() => setTheatre(null)} /> : null}</AnimatePresence>
    </>
  );
}
