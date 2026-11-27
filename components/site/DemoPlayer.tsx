"use client";

import { AnimatePresence, motion } from "motion/react";
import { Maximize2, Minimize2, Pause, Play, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type Demo = { src: string; poster: string; caption: string };

function fmt(t: number) {
  if (!Number.isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type FsEl = HTMLDivElement & { webkitRequestFullscreen?: () => void };
type FsVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

/**
 * Product demo player in the site's glass style. Nothing downloads until the visitor presses play
 * (only the poster), it never autoplays on its own, and it plays inline on phones.
 */
export function DemoPlayer({ demo, title, autoStart = false, className = "" }: { demo: Demo; title: string; autoStart?: boolean; className?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [started, setStarted] = useState(autoStart);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [controls, setControls] = useState(true);
  const [fs, setFs] = useState(false);

  const poke = useCallback(() => {
    setControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (video.current && !video.current.paused) setControls(false);
    }, 2600);
  }, []);

  useEffect(() => () => hideTimer.current && clearTimeout(hideTimer.current), []);

  useEffect(() => {
    const onFs = () => setFs(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Start playing once the source is attached (after the first press, or right away in the modal).
  useEffect(() => {
    if (!started) return;
    const v = video.current;
    if (!v) return;
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      void v.play().catch(() => undefined);
    });
  }, [started]);

  const toggle = () => {
    const v = video.current;
    if (!started) {
      setStarted(true);
      return;
    }
    if (!v) return;
    if (v.paused || v.ended) void v.play();
    else v.pause();
    poke();
  };

  const seek = (clientX: number, el: HTMLElement) => {
    const v = video.current;
    if (!v || !duration) return;
    const r = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    v.currentTime = p * duration;
    setTime(v.currentTime);
  };

  const fullscreen = () => {
    const f = frame.current as FsEl | null;
    const v = video.current as FsVideo | null;
    if (!f) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    if (f.requestFullscreen) f.requestFullscreen().catch(() => v?.webkitEnterFullscreen?.());
    else if (f.webkitRequestFullscreen) f.webkitRequestFullscreen();
    else v?.webkitEnterFullscreen?.();
  };

  const pct = duration ? (time / duration) * 100 : 0;
  const showChrome = !playing || controls;

  return (
    <div
      ref={frame}
      className={`force-dark group/player relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black text-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] ${fs ? "rounded-none border-0" : ""} ${className}`}
      onPointerMove={poke}
      onKeyDown={(e) => {
        if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement) return;
        if (e.key === " " || e.key === "k") {
          e.preventDefault();
          toggle();
        }
      }}
    >
      {/* Motion-graphic demo: on-screen text and music, no speech to caption. */}
      <video
        ref={video}
        src={started ? demo.src : undefined}
        poster={demo.poster || undefined}
        preload="none"
        playsInline
        muted={muted}
        className="absolute inset-0 h-full w-full object-contain"
        onClick={toggle}
        onPlay={() => {
          setPlaying(true);
          setEnded(false);
          poke();
        }}
        onPause={() => {
          setPlaying(false);
          setControls(true);
        }}
        onEnded={() => {
          setEnded(true);
          setPlaying(false);
          setControls(true);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onProgress={(e) => {
          const v = e.currentTarget;
          if (v.buffered.length && v.duration) setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
        }}
      />

      {/* Poster state: title + big play button */}
      <AnimatePresence>
        {!started || (!playing && (ended || time === 0)) ? (
          <motion.div
            key="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/20 to-black/40"
          >
            <button
              type="button"
              onClick={() => {
                if (ended && video.current) video.current.currentTime = 0;
                toggle();
              }}
              aria-label={`${ended ? "Replay" : "Play"} ${title} demo`}
              className="group/play relative flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-xl transition-transform duration-300 hover:scale-105 active:scale-95 sm:h-20 sm:w-20"
            >
              <span aria-hidden className="absolute inset-0 animate-ping rounded-full border border-white/20 [animation-duration:2.4s]" />
              {ended ? <RotateCcw className="h-6 w-6 sm:h-7 sm:w-7" /> : <Play className="h-6 w-6 translate-x-0.5 fill-current sm:h-7 sm:w-7" />}
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6">
              <span className="inline-block rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/85 backdrop-blur-md">
                Product demo
              </span>
              <p className="mt-2 text-base font-bold leading-tight tracking-tight sm:text-xl">{title}</p>
              {demo.caption ? <p className="mt-0.5 line-clamp-1 max-w-2xl text-xs text-white/65 sm:line-clamp-2 sm:text-sm">{demo.caption}</p> : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Control bar */}
      {started ? (
        <div
          className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pt-10 pb-2 transition-opacity duration-300 sm:px-4 sm:pb-3 ${
            showChrome && !(ended || (!playing && time === 0)) ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(time)}
            aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
            className="group/seek relative flex h-6 cursor-pointer items-center"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              seek(e.clientX, e.currentTarget);
            }}
            onPointerMove={(e) => e.buttons === 1 && seek(e.clientX, e.currentTarget)}
            onKeyDown={(e) => {
              const v = video.current;
              if (!v) return;
              if (e.key === "ArrowRight") v.currentTime = Math.min(duration, v.currentTime + 5);
              if (e.key === "ArrowLeft") v.currentTime = Math.max(0, v.currentTime - 5);
            }}
          >
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/15 transition-[height] group-hover/seek:h-1.5">
              <div className="absolute inset-y-0 left-0 bg-white/25" style={{ width: `${buffered}%` }} />
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#007acc] via-sky-400 to-emerald-400" style={{ width: `${pct}%` }} />
            </div>
            <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${pct}%` }} />
          </div>
          <div className="mt-1 flex items-center gap-1">
            <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/10">
              {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 translate-x-px fill-current" />}
            </button>
            <button
              type="button"
              onClick={() => {
                const v = video.current;
                if (!v) return;
                v.muted = !v.muted;
                setMuted(v.muted);
              }}
              aria-label={muted ? "Unmute" : "Mute"}
              className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/10"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <span className="ml-1 font-mono text-[11px] tabular-nums text-white/75">
              {fmt(time)} <span className="text-white/40">/ {fmt(duration)}</span>
            </span>
            <span className="ml-auto hidden max-w-[40%] truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 sm:block">{title}</span>
            <button type="button" onClick={fullscreen} aria-label={fs ? "Exit full screen" : "Full screen"} className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/10 sm:ml-2">
              {fs ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Full-screen modal around the player (used from the project cards). */
export function DemoModal({ demo, title, onClose }: { demo: Demo; title: string; onClose: () => void }) {
  useEffect(() => {
    window.__lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.__lenis?.start();
    };
  }, [onClose]);

  // Portal: the cards use transforms, which would trap a fixed overlay inside them.
  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} demo`}
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="force-dark fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/90 px-3 text-white backdrop-blur-xl sm:px-6"
      style={{ paddingTop: "max(12px, env(safe-area-inset-top))", paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      onClick={(e) => {
        e.stopPropagation(); // React events bubble through portals to the card
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full items-center justify-between gap-3 py-2" style={{ maxWidth: "min(72rem, calc((100dvh - 7rem) * 16 / 9))" }}>
        <p className="truncate text-sm font-semibold tracking-tight">
          <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Demo</span>
          {title}
        </p>
        <button type="button" onClick={onClose} aria-label="Close demo" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20">
          <X className="h-5 w-5" />
        </button>
      </div>
      <motion.div
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="w-full"
        style={{ maxWidth: "min(72rem, calc((100dvh - 7rem) * 16 / 9))" }}
      >
        <DemoPlayer demo={demo} title={title} autoStart />
      </motion.div>
    </motion.div>,
    document.body,
  );
}
