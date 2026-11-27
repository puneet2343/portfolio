"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          window.location.href = `mailto:${email}`;
        }
      }}
      className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-xs font-medium text-foreground/70 transition hover:bg-white/10 hover:text-foreground"
    >
      {done ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      <span aria-live="polite">{done ? "Copied" : "Copy email"}</span>
    </button>
  );
}
