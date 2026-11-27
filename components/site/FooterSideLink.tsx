"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { modeOf } from "./ModeSwitch";

/** Footer pill that leads to the other side of the portfolio. */
export function FooterSideLink() {
  const art = modeOf(usePathname()) === "art";
  return (
    <Link
      href={art ? "/" : "/art"}
      className="flex h-11 items-center rounded-full border border-white/10 bg-white/5 px-4 text-xs font-medium text-foreground/70 transition hover:bg-white/10 hover:text-foreground"
    >
      {art ? "Professional" : "Art side"}
    </Link>
  );
}
