"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useRef, useState } from "react";

type Status = { kind: "idle" | "sending" | "ok" | "error"; text?: string };

const field =
  "mt-1.5 block w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-foreground placeholder:text-foreground/40 outline-none transition focus:border-[#007acc] focus:ring-2 focus:ring-[#007acc]/25";

export function ContactForm() {
  const started = useRef<number>(0);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, t: started.current || Date.now() - 60000 }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Couldn't send. Please email me instead.");
      form.reset();
      setStatus({ kind: "ok", text: "Thanks, your message is in. I'll reply by email." });
    } catch (err) {
      setStatus({ kind: "error", text: err instanceof Error ? err.message : "Couldn't send." });
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      onFocus={() => {
        if (!started.current) started.current = Date.now();
      }}
      className="relative rounded-3xl border border-white/10 bg-background/60 p-5 sm:p-7 backdrop-blur-md shadow-2xl shadow-black/50"
      noValidate={false}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-medium uppercase tracking-widest text-foreground/60">
          Name
          <input name="name" required minLength={2} maxLength={120} autoComplete="name" className={field} />
        </label>
        <label className="block text-xs font-medium uppercase tracking-widest text-foreground/60">
          Email
          <input name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
        </label>
      </div>
      <label className="mt-4 block text-xs font-medium uppercase tracking-widest text-foreground/60">
        Subject <span className="font-normal normal-case tracking-normal text-foreground/40">(optional)</span>
        <input name="subject" maxLength={200} className={field} />
      </label>
      <label className="mt-4 block text-xs font-medium uppercase tracking-widest text-foreground/60">
        Message
        <textarea name="message" required minLength={10} maxLength={5000} rows={5} className={`${field} resize-y`} />
      </label>

      {/* Honeypot: hidden from people and screen readers */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          role="status"
          aria-live="polite"
          className={`text-sm ${status.kind === "error" ? "text-red-400" : "text-emerald-500"}`}
        >
          {status.text}
        </p>
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition hover:scale-[1.02] active:scale-95 disabled:opacity-60"
        >
          {status.kind === "sending" ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )}
          Send message
        </button>
      </div>
    </form>
  );
}
