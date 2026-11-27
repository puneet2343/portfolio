"use client";

import { AnimatePresence, motion, useMotionTemplate, useMotionValue } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { EventPhoto } from "@/lib/types";

function splitHeading(h: string) {
  const words = h.trim().split(/\s+/);
  if (words.length < 2) return { first: "", last: h };
  return { first: words.slice(0, -1).join(" "), last: words[words.length - 1] };
}

/** Event photos in the original glass-card style, with a simple lightbox. */
export default function Events({ heading, intro, photos }: { heading: string; intro: string; photos: EventPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const { first, last } = splitHeading(heading || "Recent Events");

  useEffect(() => {
    if (open === null) return;
    window.__lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.__lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, photos.length]);

  if (!photos.length) return null;
  const [lead, ...rest] = photos;

  return (
    <section id="events" aria-labelledby="events-title" className="relative bg-background text-foreground font-sans py-16 md:py-24 lg:py-32 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-40 right-0 h-[420px] w-[420px] rounded-full bg-[#007acc]/10 blur-[140px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-10 md:mb-16 gap-6 md:gap-12">
          <h2 id="events-title" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground">
            {first} <br className="hidden sm:block" /> <span className="text-foreground/50">{last}.</span>
          </h2>
          <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 backdrop-blur-xl">
            <p className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-emerald-500">
              <CalendarDays size={12} aria-hidden /> Latest
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">{intro}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 auto-rows-[160px] sm:auto-rows-[220px] md:auto-rows-[240px]">
          <PhotoCard photo={lead} onOpen={() => setOpen(0)} className="col-span-2 row-span-2" priority />
          {rest.map((p, i) => (
            <PhotoCard key={p.id} photo={p} onOpen={() => setOpen(i + 1)} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open !== null && photos[open] && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={photos[open].caption || "Photo"}
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="force-dark fixed inset-0 z-[80] flex flex-col bg-black/90 backdrop-blur-xl"
            style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
            onClick={() => setOpen(null)}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
              <span className="text-xs font-mono tracking-widest text-white/60">
                {open + 1} / {photos.length}
              </span>
              <button type="button" aria-label="Close photo" className="h-11 w-11 flex items-center justify-center rounded-full border border-white/20 bg-white/10" onClick={() => setOpen(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="relative flex-1 mx-2 sm:mx-14" onClick={(e) => e.stopPropagation()}>
              <motion.div key={open} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0">
                <Image src={photos[open].src} alt={photos[open].alt} fill sizes="100vw" className="object-contain" />
              </motion.div>
            </div>
            <p className="px-6 py-4 text-center text-sm text-white/80">{photos[open].caption}</p>
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((open - 1 + photos.length) % photos.length);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-full border border-white/20 bg-white/10 text-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((open + 1) % photos.length);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-full border border-white/20 bg-white/10 text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function PhotoCard({ photo, onOpen, className = "", priority }: { photo: EventPhoto; onOpen: () => void; className?: string; priority?: boolean }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spot = useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.12), transparent 70%)`;
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      onMouseMove={({ currentTarget, clientX, clientY }) => {
        const r = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - r.left);
        mouseY.set(clientY - r.top);
      }}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      aria-label={`Open photo: ${photo.caption || photo.alt}`}
      className={`group relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-white/[0.03] text-left shadow-2xl shadow-black/50 ${className}`}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        priority={priority}
        sizes={priority ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <motion.div className="pointer-events-none absolute inset-0 z-10 opacity-0 transition duration-300 group-hover:opacity-100 hidden md:block" style={{ background: spot }} />
      <div className="force-dark pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-3 pt-10 sm:p-4 sm:pt-12">
        <p className="text-[11px] sm:text-xs font-medium text-white/90 leading-snug">{photo.caption}</p>
      </div>
    </motion.button>
  );
}
