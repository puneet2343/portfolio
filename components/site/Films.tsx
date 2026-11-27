"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Volume2, VolumeX, Clapperboard, Sparkles, Film, MapPin, Camera, Sunrise, Wind, Cloud, Palette, Sun, Maximize2, Play,
} from "lucide-react";
import type { BeyondItem, FilmTheme } from "@/lib/types";

type ThemeDef = {
  LoaderIcon: React.ComponentType<{ className?: string }>;
  loaderIconCls: string;
  loaderDot: string;
  loaderBar: string;
  loaderText: string;
  KickerIcon: React.ComponentType<{ className?: string }>;
  kickerCls: string;
  accent: string;
  glow: string;
  overlay: string;
  audio: [string, string];
  audioLeft?: boolean;
  hover: string;
  TagIcon: React.ComponentType<{ className?: string }>;
  intro: [number, number, number];
};

// Colours, icons and timings of each film block on the original site
const THEMES: Record<FilmTheme, ThemeDef> = {
  gold: {
    LoaderIcon: Clapperboard, loaderIconCls: "text-neutral-600 animate-pulse", loaderDot: "-top-1 -right-1 bg-red-500",
    loaderBar: "from-neutral-500 via-white to-neutral-500", loaderText: "Loading 16mm Reel",
    KickerIcon: Sparkles, kickerCls: "text-yellow-600/70", accent: "from-yellow-200 via-yellow-500 to-yellow-700",
    glow: "bg-yellow-600/5", overlay: "from-black/60 via-transparent to-black/30", audio: ["Audio", "STEREO"],
    hover: "hover:text-yellow-400", TagIcon: Film, intro: [3000, 6500, 1500],
  },
  orange: {
    LoaderIcon: Camera, loaderIconCls: "text-neutral-600 animate-pulse", loaderDot: "-top-1 -right-1 bg-orange-500",
    loaderBar: "from-neutral-500 via-white to-neutral-500", loaderText: "Focusing Lens",
    KickerIcon: MapPin, kickerCls: "text-orange-600/70", accent: "from-orange-200 via-orange-500 to-red-700",
    glow: "bg-orange-600/5", overlay: "from-black/60 via-transparent to-black/30", audio: ["Ambience", "RAW STEREO"],
    hover: "hover:text-orange-400", TagIcon: Camera, intro: [3000, 6500, 1500],
  },
  blue: {
    LoaderIcon: Sunrise, loaderIconCls: "text-neutral-600 animate-pulse", loaderDot: "-top-1 -right-1 bg-blue-500",
    loaderBar: "from-neutral-500 via-white to-neutral-500", loaderText: "Waking City",
    KickerIcon: Wind, kickerCls: "text-blue-400/80", accent: "from-blue-200 via-blue-100 to-amber-500",
    glow: "bg-blue-600/10", overlay: "from-black/60 via-blue-900/10 to-black/30", audio: ["Soundscape", "DOLBY ATMOS"],
    hover: "hover:text-blue-400", TagIcon: Sunrise, intro: [4000, 6000, 1000],
  },
  sunset: {
    LoaderIcon: Sun, loaderIconCls: "text-orange-500 animate-spin-slow", loaderDot: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white",
    loaderBar: "from-orange-500 via-yellow-200 to-blue-500", loaderText: "Painting Sky",
    KickerIcon: Cloud, kickerCls: "text-orange-400/80", accent: "from-orange-200 via-white to-blue-400",
    glow: "bg-orange-600/10", overlay: "from-black/60 via-orange-900/10 to-black/30", audio: ["Ambient", "STEREO"], audioLeft: true,
    hover: "hover:text-orange-400", TagIcon: Palette, intro: [4000, 6000, 1000],
  },
  purple: {
    LoaderIcon: Sunrise, loaderIconCls: "text-neutral-600 animate-pulse", loaderDot: "-top-1 -right-1 bg-blue-500",
    loaderBar: "from-neutral-500 via-white to-neutral-500", loaderText: "Igniting Vision",
    KickerIcon: Wind, kickerCls: "text-purple-400/80", accent: "from-purple-200 via-white to-pink-500",
    glow: "bg-purple-600/10", overlay: "from-black/60 via-blue-900/10 to-black/30", audio: ["Soundscape", "DOLBY ATMOS"],
    hover: "hover:text-blue-400", TagIcon: Sunrise, intro: [4000, 6000, 1000],
  },
};

export function FilmsIntro({ kicker, heading, accent, intro, as = "h2" }: { kicker: string; heading: string; accent: string; intro: string; as?: "h1" | "h2" }) {
  const H = as;
  return (
    <section id="films" aria-labelledby="films-title" className="relative w-full bg-black py-32 md:py-48 flex flex-col items-center justify-center text-center px-6 overflow-hidden border-b border-white/10">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-neutral-600 to-transparent opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-full h-[400px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3 text-neutral-500 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <Clapperboard className="w-4 h-4" />
          <span className="text-[10px] font-mono tracking-[0.4em] uppercase font-bold">{kicker}</span>
        </div>

        <H id="films-title" className="text-4xl md:text-6xl lg:text-7xl font-serif text-white tracking-tighter leading-tight opacity-0 animate-cinematic-up" style={{ animationDelay: "0.4s" }}>
          {heading} <br className="md:hidden" />
          <span className="film-accent text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 via-white to-neutral-500">{accent}</span>
        </H>

        <div className="w-[1px] h-16 bg-gradient-to-b from-neutral-500 to-transparent mx-auto opacity-0 animate-cinematic-grow" style={{ animationDelay: "0.6s" }} />

        <p className="text-sm md:text-base lg:text-lg font-light leading-relaxed text-neutral-400 font-serif italic max-w-2xl opacity-0 animate-cinematic-fade" style={{ animationDelay: "0.8s" }}>
          &ldquo;{intro}&rdquo;
        </p>
      </div>
    </section>
  );
}

export function FilmBlock({ film, index, directedBy }: { film: BeyondItem; index: number; directedBy: string }) {
  const t = THEMES[film.theme] ?? THEMES.gold;
  const [near, setNear] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Lazy-load: only fetch the video when the block is about to scroll into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Fake reel-loading counter (as on the original site) once loading starts
  useEffect(() => {
    if (!near) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.floor(Math.random() * 15) + 1;
      });
    }, 150);
    // Never keep the reel covered for long on slow connections: the poster shows instead.
    const giveUp = setTimeout(() => setIsLoading(false), 7000);
    return () => {
      clearInterval(interval);
      clearTimeout(giveUp);
    };
  }, [near]);

  useEffect(() => {
    if (!isLoading) {
      const startTimer = setTimeout(() => setShowIntro(true), t.intro[0]);
      const endTimer = setTimeout(() => setShowIntro(false), t.intro[1]);
      return () => {
        clearTimeout(startTimer);
        clearTimeout(endTimer);
      };
    }
  }, [isLoading, t.intro]);

  const handleVideoLoad = () => {
    setProgress(100);
    setTimeout(() => setIsLoading(false), 800);
  };

  const attemptPlay = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      await v.play();
    } catch {
      /* autoplay blocked: the poster and play button stay */
    }
  }, []);

  // Muted autoplay while at least half the block is on screen
  useEffect(() => {
    if (!near) return;
    const el = sectionRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        const v = videoRef.current;
        if (!v) return;
        if (entries[0].isIntersecting) {
          if (!reduce) void attemptPlay();
        } else if (!v.paused) v.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, attemptPlay]);

  const toggleSound = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
    if (v.paused) void attemptPlay();
  };

  const fullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    const frame = frameRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    if (!v || !frame) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    if (v.muted) {
      v.muted = false;
      setIsMuted(false);
    }
    if (v.paused) void attemptPlay();
    if (frame.requestFullscreen) frame.requestFullscreen().catch(() => v.webkitEnterFullscreen?.());
    else if (frame.webkitRequestFullscreen) frame.webkitRequestFullscreen();
    else v.webkitEnterFullscreen?.();
  };

  const KickerIcon = t.KickerIcon;
  const TagIcon = t.TagIcon;
  const LoaderIcon = t.LoaderIcon;
  const side = film.videoRight ? "md:flex-row-reverse" : "md:flex-row";
  const border = film.videoRight ? "md:border-l" : "md:border-r";
  const rotated = film.rotate;

  const soundButton = (
    <button
      type="button"
      onClick={toggleSound}
      aria-label={isMuted ? `Unmute ${film.title} ${film.titleAccent}` : `Mute ${film.title} ${film.titleAccent}`}
      className="h-11 w-11 sm:h-9 sm:w-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/30 transition-all duration-300"
    >
      {isMuted ? <VolumeX className="w-4 h-4 text-white/70" /> : <Volume2 className={`w-4 h-4 text-white ${t.hover}`} />}
    </button>
  );
  const audioLabel = (
    <div className={`${t.audioLeft ? "text-left" : "text-right"} hidden sm:block`}>
      <p className="text-[8px] font-bold tracking-widest text-white/90 uppercase">{t.audio[0]}</p>
      <p className="text-[8px] text-white/60 font-mono">{isMuted ? "TAP TO UNMUTE" : t.audio[1]}</p>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      data-film={index}
      aria-label={`${film.title} ${film.titleAccent}`}
      className={`relative w-full min-h-screen bg-black overflow-hidden flex flex-col ${side}`}
    >
      {/* Reel loader (covers the block while the video buffers) */}
      <div
        className={`force-dark absolute inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-1000 ease-out ${
          isLoading && near ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!(isLoading && near)}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <LoaderIcon className={`w-10 h-10 ${t.loaderIconCls}`} />
            <div className={`absolute w-2 h-2 rounded-full animate-ping ${t.loaderDot}`} />
          </div>
          <div className="h-[2px] w-48 bg-neutral-900 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${t.loaderBar} transition-all duration-200`} style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-neutral-500 uppercase">
            {t.loaderText} {progress}%
          </span>
        </div>
      </div>

      {/* Video */}
      <div className={`force-dark w-full md:flex-1 bg-black flex items-center justify-center relative border-b md:border-b-0 ${border} border-white/10`}>
        <div ref={frameRef} onClick={() => toggleSound()} className="relative w-full aspect-video group bg-neutral-900 overflow-hidden shadow-2xl cursor-pointer">
          <video
            ref={videoRef}
            className={rotated ? "absolute top-1/2 left-1/2 w-full h-full object-contain transform-gpu" : "w-full h-full object-cover transform-gpu"}
            style={rotated ? { transform: "translate(-50%, -50%) rotate(-90deg) scale(1.778)" } : undefined}
            loop
            muted
            playsInline
            preload={near ? "auto" : "none"}
            poster={film.poster || undefined}
            src={near ? film.video : undefined}
            onLoadedData={handleVideoLoad}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          <div className={`absolute inset-0 bg-gradient-to-t ${t.overlay} pointer-events-none`} />

          <div
            className={`absolute inset-0 z-30 flex flex-col items-center justify-center text-center pointer-events-none transition-all ease-[cubic-bezier(0.19,1,0.22,1)] ${
              t.intro[2] === 1500 ? "duration-[1500ms]" : "duration-[1000ms]"
            } ${showIntro && !isLoading ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-110 blur-md"}`}
          >
            <div className="space-y-2 md:space-y-4 mix-blend-overlay">
              <p className="text-[8px] md:text-[10px] font-bold tracking-[0.6em] text-white/80 uppercase">Directed By</p>
              <p className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-xl">{directedBy}</p>
            </div>
          </div>

          {!isPlaying && !isLoading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <span className="h-14 w-14 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <Play className="w-5 h-5 text-white translate-x-0.5" />
              </span>
            </div>
          )}

          {!isLoading && (
            <div className={`absolute bottom-3 sm:bottom-4 ${t.audioLeft ? "left-3 sm:left-4" : "right-3 sm:right-4"} z-40 flex items-center gap-2 sm:gap-3 animate-fade-in`}>
              {t.audioLeft ? (
                <>
                  {soundButton}
                  {audioLabel}
                </>
              ) : (
                <>
                  {audioLabel}
                  {soundButton}
                </>
              )}
            </div>
          )}
          {!isLoading && (
            <button
              type="button"
              onClick={fullscreen}
              aria-label={`Watch ${film.title} ${film.titleAccent} full screen`}
              className={`absolute top-3 sm:top-4 ${t.audioLeft ? "right-3 sm:right-4" : "left-3 sm:left-4"} z-40 h-11 w-11 sm:h-9 sm:w-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/30 transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100`}
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Text */}
      <div className="w-full md:w-[40%] lg:w-[35%] bg-black flex flex-col items-center justify-center p-8 md:p-12 z-20 relative overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] ${t.glow} blur-[90px] rounded-full pointer-events-none`} />
        <div className="relative max-w-sm text-center md:text-left space-y-8 md:space-y-12">
          <div className="flex flex-col items-center md:items-start gap-3 opacity-0 animate-cinematic-fade" style={{ animationDelay: "0.2s" }}>
            <div className={`flex items-center gap-2 ${t.kickerCls}`}>
              <KickerIcon className="w-3 h-3" />
              <span className="text-[9px] font-mono tracking-[0.3em] uppercase">{film.kicker}</span>
            </div>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-tight leading-[0.9]">
              {film.title} <br />
              <span className={`film-accent text-transparent bg-clip-text bg-gradient-to-r ${t.accent}`}>{film.titleAccent}</span>
            </h3>
          </div>

          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-neutral-700 to-transparent mx-auto md:mx-0 opacity-0 animate-cinematic-grow" style={{ animationDelay: "0.5s" }} />

          <p className="text-sm md:text-base font-light leading-relaxed text-neutral-400 opacity-0 animate-cinematic-up font-serif italic" style={{ animationDelay: "0.8s" }}>
            &ldquo;{film.quote}&rdquo;
          </p>

          {film.tags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 opacity-0 animate-cinematic-fade" style={{ animationDelay: "1.2s" }}>
              {film.tags.map((tag, i) => (
                <React.Fragment key={tag}>
                  {i > 0 && <div className="w-1 h-1 bg-neutral-800 rounded-full" />}
                  {i === 0 ? (
                    <div className="flex items-center gap-2 text-neutral-700">
                      <TagIcon className="w-3 h-3" />
                      <span className="text-[9px] tracking-widest uppercase font-bold">{tag}</span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-neutral-700 tracking-widest uppercase font-bold">{tag}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
