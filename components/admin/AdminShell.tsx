"use client";

import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { AdminProvider, api, useAdmin } from "./AdminProvider";
import { ADMIN_NAV } from "./nav";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="space-y-6">
      {ADMIN_NAV.map((g) => (
        <div key={g.group}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-subtle">{g.group}</p>
          <ul className="space-y-0.5">
            {g.items.map((i) => {
              const on = pathname === i.href;
              return (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    onClick={onNavigate}
                    aria-current={on ? "page" : undefined}
                    className={`block rounded-xl px-3 py-2.5 text-[0.95rem] transition ${on ? "bg-accent-soft font-medium text-fg" : "text-muted hover:bg-[var(--glass)] hover:text-fg"}`}
                  >
                    {i.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function StorageBanner() {
  const { storage, error } = useAdmin();
  if (error) {
    return <div className="mb-6 rounded-2xl border border-[#b42318]/30 bg-[#b42318]/10 px-4 py-3 text-sm">{error}</div>;
  }
  if (storage && !storage.writable) {
    return (
      <div className="mb-6 rounded-2xl border border-[#b54708]/30 bg-[#f79009]/12 px-4 py-3 text-sm" role="status">
        <strong className="font-semibold">Storage not connected yet — changes won&apos;t be saved.</strong> The site is showing the
        built-in content. Add <code>MONGODB_URI</code> (and <code>BLOB_READ_WRITE_TOKEN</code> for uploads) in Vercel to enable editing.
      </div>
    );
  }
  return null;
}

async function logout() {
  try {
    await api("/api/admin/logout", { method: "POST" });
  } finally {
    window.location.href = "/admin/login";
  }
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const current = ADMIN_NAV.flatMap((g) => g.items).find((i) => i.href === pathname)?.label ?? "Admin";

  return (
    <AdminProvider>
      <div className="backdrop" aria-hidden>
        <span className="b1" />
        <span className="b2" />
        <span className="b3" />
      </div>
      <div className="admin mx-auto flex min-h-dvh max-w-7xl gap-6 px-3 py-3 sm:px-5 lg:py-5">
        {/* Desktop sidebar */}
        <aside className="glass sticky top-5 hidden h-[calc(100dvh-2.5rem)] w-64 shrink-0 flex-col overflow-y-auto rounded-[1.6rem] p-4 lg:flex">
          <div className="mb-6 flex items-center justify-between px-3">
            <Link href="/admin" className="font-serif text-lg font-medium">
              Site admin
            </Link>
            <ThemeToggle />
          </div>
          <NavLinks />
          <div className="mt-auto space-y-1 pt-6">
            <a href="/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted hover:text-fg">
              <ExternalLink className="h-4 w-4" aria-hidden /> View site
            </a>
            <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted hover:text-fg">
              <LogOut className="h-4 w-4" aria-hidden /> Log out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile top bar */}
          <div className="glass sticky top-3 z-40 mb-5 flex h-14 items-center justify-between rounded-full pl-5 pr-1.5 lg:hidden">
            <span className="truncate font-medium">{current}</span>
            <div className="flex items-center">
              <ThemeToggle />
              <button
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full"
              >
                <Menu className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>

          <main className="pb-28">
            <StorageBanner />
            {children}
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button className="absolute inset-0 bg-black/30" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="admin glass glass-strong absolute inset-y-2 right-2 flex w-[min(20rem,88vw)] flex-col overflow-y-auto rounded-[1.6rem] p-4">
            <div className="mb-4 flex items-center justify-between px-3">
              <span className="font-serif text-lg font-medium">Site admin</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="inline-flex h-11 w-11 items-center justify-center rounded-full">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-6 space-y-1 border-t border-line pt-4">
              <a href="/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-muted">
                <ExternalLink className="h-4 w-4" aria-hidden /> View site
              </a>
              <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm text-muted">
                <LogOut className="h-4 w-4" aria-hidden /> Log out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminProvider>
  );
}
