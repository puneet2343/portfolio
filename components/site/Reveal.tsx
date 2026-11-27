"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Gentle fade-up when a block scrolls into view. No movement for reduced-motion users. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduce = useReducedMotion();
  const Comp = m[as];
  return (
    <LazyMotion features={domAnimation} strict>
      <Comp
        className={className}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
        whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -60px 0px" }}
        transition={{ duration: reduce ? 0.2 : 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </Comp>
    </LazyMotion>
  );
}
