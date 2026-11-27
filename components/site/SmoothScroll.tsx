"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Scroll to an element id (or the top), smoothly through Lenis when it's running. */
export function scrollToId(id: string, offset = -84) {
  if (id === "top") {
    if (window.__lenis) window.__lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }
  const el = document.getElementById(id);
  if (!el) return false;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

/**
 * Lenis smooth scroll with the original site's feel, driven by the GSAP ticker so
 * ScrollTrigger pins stay in sync. Off when the visitor prefers reduced motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const lenis = new Lenis({
      lerp: 0.04,
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.7,
      touchMultiplier: 1.5,
      infinite: false,
      autoRaf: false,
      anchors: { offset: -84 },
    });
    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Arriving with a #hash (e.g. from /films to /#contact): settle there after layout.
    const hash = decodeURIComponent(window.location.hash.slice(1));
    let t: ReturnType<typeof setTimeout> | undefined;
    if (hash) t = setTimeout(() => scrollToId(hash), 350);

    return () => {
      if (t) clearTimeout(t);
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}
