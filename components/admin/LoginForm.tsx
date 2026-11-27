"use client";

import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { inputCls } from "./fields";

export function LoginForm() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: fd.get("username"), password: fd.get("password") }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Couldn't sign in.");
      window.location.href = "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign in.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
          Username
        </label>
        <input id="username" name="username" required autoComplete="username" autoCapitalize="none" spellCheck={false} className={inputCls} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <div className="relative">
          <input id="password" name="password" type={show ? "text" : "password"} required autoComplete="current-password" className={`${inputCls} pr-12`} />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-muted"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <p role="alert" className="min-h-5 text-sm text-[#b42318] dark:text-[#ff9b8f]">
        {error}
      </p>
      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent font-medium text-accent-ink transition hover:brightness-110 disabled:opacity-60"
      >
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
        Sign in
      </button>
    </form>
  );
}
