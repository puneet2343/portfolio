"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronLeft, ChevronRight, Clapperboard, Images, Play } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ArtCategory, ArtMedia } from "@/lib/types";
import { SocialGlyph } from "./bits";

// The theatre player only loads when someone opens a piece.
const Theatre = dynamic(() => import("./Theatre").then((m) => m.Theatre), { ssr: false });

export type CinemaItem = {
  id: string;
  title: string;
  category: string;
  kind?: string;
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
  // The poster paints first; the short loop starts loading once the page is idle.
  const [load, setLoad] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => setLoad(true), { timeout: 1500 });
    else setTimeout(() => setLoad(true), 600);
  }, []);

  // Muted autoplay; pause when off screen.
  useEffect(() => {
    const v = ref.current;
    if (!v || !load) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) void v.play().catch(() => undefined);
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [load]);

  return (
    <section aria-labelledby="art-title" className="relative isolate flex h-[100svh] min-h-[540px] w-full items-end overflow-hidden bg-black text-white">
      {video ? (
        <video
          ref={ref}
          src={load ? video : undefined}
          poster={poster || undefined}
          muted
          loop
          playsInline
          preload="none"
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
      className="film-card group relative h-full max-w-[min(80vw,28rem)] shrink-0 snap-start overflow-hidden rounded-xl bg-white/[0.04] text-left ring-1 ring-white/10 transition-[opacity,filter,box-shadow,transform] duration-500 hover:ring-white/30 focus-visible:ring-white/60"
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
        {item.kind === "film" ? <span className="mb-1.5 inline-block rounded-full border border-amber-200/40 bg-black/40 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-amber-100 backdrop-blur-md">Film</span> : null}
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
        className="film-row no-scrollbar mt-4 flex h-[clamp(220px,52vw,300px)] snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-5 pb-1 scroll-px-5 sm:gap-4 sm:px-8 sm:scroll-px-8 md:h-[300px] lg:h-[320px] xl:px-[max(2rem,calc((100vw-80rem)/2+2rem))] xl:scroll-px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
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
