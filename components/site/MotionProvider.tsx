"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Animations always run, even when the OS reports "reduce motion" (Windows with animations
 * turned off reports that, and the owner wants the site's motion on).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
