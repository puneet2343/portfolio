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
      className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm text-muted transition hover:text-fg"
    >
      {done ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      <span aria-live="polite">{done ? "Copied" : "Copy email"}</span>
    </button>
  );
}
