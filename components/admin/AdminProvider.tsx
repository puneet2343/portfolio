"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { ContentKey, SiteContent } from "@/lib/types";

export type StorageInfo = { kind: "file" | "mongo" | "readonly"; writable: boolean; uploads: boolean };

type Ctx = {
  content: SiteContent | null;
  storage: StorageInfo | null;
  error: string;
  save: <K extends ContentKey>(key: K, value: SiteContent[K]) => Promise<{ ok: boolean; error?: string }>;
  reload: () => Promise<void>;
  toast: (text: string, kind?: "ok" | "error") => void;
};

const AdminCtx = createContext<Ctx | null>(null);

export function useAdmin() {
  const c = useContext(AdminCtx);
  if (!c) throw new Error("useAdmin outside provider");
  return c;
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { ...(init?.body instanceof FormData ? {} : { "content-type": "application/json" }), ...init?.headers } });
  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Signed out");
  }
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState<{ id: number; text: string; kind: "ok" | "error" }[]>([]);

  const toast = useCallback((text: string, kind: "ok" | "error" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const reload = useCallback(async () => {
    try {
      const data = await api<{ content: SiteContent; storage: StorageInfo }>("/api/admin/content");
      setContent(data.content);
      setStorage(data.storage);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load content.");
    }
  }, []);

  useEffect(() => {
    // Load once on mount; state updates happen after the request resolves.
    void reload();
  }, [reload]);

  const save: Ctx["save"] = useCallback(
    async (key, value) => {
      try {
        const res = await api<{ value: SiteContent[typeof key]; updatedAt: string }>("/api/admin/content", {
          method: "PATCH",
          body: JSON.stringify({ key, value }),
        });
        setContent((c) => (c ? { ...c, [key]: res.value, updatedAt: res.updatedAt } : c));
        toast("Saved. The live site updates on the next visit.");
        return { ok: true };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Save failed.";
        toast(msg, "error");
        return { ok: false, error: msg };
      }
    },
    [toast],
  );

  return (
    <AdminCtx.Provider value={{ content, storage, error, save, reload, toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`glass glass-strong pointer-events-auto rounded-full px-5 py-3 text-sm font-medium ${t.kind === "error" ? "text-[#b42318] dark:text-[#ff9b8f]" : ""}`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </AdminCtx.Provider>
  );
}
