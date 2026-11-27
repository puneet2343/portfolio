"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ViewStats } from "@/lib/types";
import { api, useAdmin } from "./AdminProvider";
import { PageTitle } from "./Editor";

type Stats = {
  views: ViewStats;
  messages: { total: number; unread: number };
  storage: { kind: string; writable: boolean };
};

const STORAGE_LABEL: Record<string, string> = {
  mongo: "MongoDB (live)",
  file: "Local JSON files",
  readonly: "Not connected (read-only)",
};

function Tile({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="glass rounded-[1.4rem] p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-serif text-4xl font-medium tabular-nums">{value}</p>
      {note ? <p className="mt-1 text-xs text-subtle">{note}</p> : null}
    </div>
  );
}

function ViewsChart({ days }: { days: ViewStats["days"] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const fmt = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return (
    <figure className="glass rounded-[1.4rem] p-5">
      <figcaption className="mb-4 flex items-baseline justify-between">
        <span className="font-medium">Page views, last 14 days</span>
        <span className="text-xs text-subtle">max {max}/day</span>
      </figcaption>
      <div className="relative h-40">
        <div className="absolute inset-x-0 bottom-0 border-t border-line" aria-hidden />
        <ol className="flex h-full items-end gap-[2px]" aria-hidden>
          {days.map((d) => (
            <li key={d.date} className="group relative flex h-full flex-1 items-end justify-center">
              <span
                className="w-full max-w-6 rounded-t-[4px] bg-accent transition-opacity group-hover:opacity-80"
                style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 3 : 0 }}
              />
              <span className="pointer-events-none absolute -top-9 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-fg px-2 py-1 text-xs text-bg group-hover:block">
                {fmt(d.date)}: {d.count}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-2 flex justify-between text-xs text-subtle" aria-hidden>
        <span>{fmt(days[0].date)}</span>
        <span>{fmt(days[days.length - 1].date)}</span>
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-muted">Show as table</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="text-subtle">
              <th className="py-1 font-medium">Day</th>
              <th className="py-1 text-right font-medium">Views</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date} className="border-t border-line">
                <td className="py-1">{fmt(d.date)}</td>
                <td className="py-1 text-right tabular-nums">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

export function Dashboard() {
  const { content } = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Stats>("/api/admin/stats")
      .then(setStats)
      .catch((e: Error) => setError(e.message));
  }, []);

  const week = stats ? stats.views.days.slice(-7).reduce((a, d) => a + d.count, 0) : 0;
  const drafts = content
    ? content.projects.filter((p) => !p.published).length +
      content.experience.filter((p) => !p.published).length +
      content.skills.filter((p) => !p.published).length +
      content.education.filter((p) => !p.published).length +
      content.events.photos.filter((p) => !p.published).length
    : 0;

  return (
    <div>
      <PageTitle title="Dashboard" intro="Visits are counted on this site only: no cookies, no third-party trackers, your own visits are skipped." />
      {error ? <p className="mb-4 text-sm text-[#b42318]">{error}</p> : null}
      {!stats ? (
        <div className="glass flex items-center gap-3 rounded-2xl p-6 text-muted">
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden /> Loading…
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tile label="Views, last 7 days" value={week} />
            <Tile label="Views, all time" value={stats.views.total} />
            <Tile label="Unread messages" value={stats.messages.unread} note={`${stats.messages.total} total`} />
            <Tile label="Hidden drafts" value={drafts} note="Items not shown on the site" />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ViewsChart days={stats.views.days} />
            </div>
            <div className="glass rounded-[1.4rem] p-5">
              <p className="mb-3 font-medium">Top pages</p>
              {stats.views.topPaths.length ? (
                <ol className="space-y-2 text-sm">
                  {stats.views.topPaths.map((p) => (
                    <li key={p.path} className="flex justify-between gap-3">
                      <span className="truncate text-muted">{p.path}</span>
                      <span className="tabular-nums">{p.count}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted">No visits yet.</p>
              )}
              <p className="mt-5 border-t border-line pt-3 text-xs text-subtle">Storage: {STORAGE_LABEL[stats.storage.kind] ?? stats.storage.kind}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { href: "/admin/messages", label: "Read messages" },
              { href: "/admin/edit/profile", label: "Edit hero text" },
              { href: "/admin/edit/projects", label: "Manage projects" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="glass flex items-center justify-between rounded-2xl px-5 py-4 font-medium transition hover:bg-[var(--glass-strong)]">
                {l.label} <ArrowRight className="h-4 w-4 text-accent" aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
