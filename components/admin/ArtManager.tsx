"use client";

import { Check, Eye, EyeOff, Film, Images, LoaderCircle, Plus, Save, Star, Trash, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ArtItem } from "@/lib/types";
import { api, useAdmin } from "./AdminProvider";
import { PageTitle } from "./Editor";
import { ObjectForm, type Field } from "./Form";

/* eslint-disable @typescript-eslint/no-explicit-any */

const blank = (category: string): Partial<ArtItem> => ({
  title: "",
  caption: "",
  category,
  media: [{ type: "image", src: "", poster: "", width: 0, height: 0 }],
  thumb: "",
  date: new Date().toISOString().slice(0, 10),
  order: 0,
  featured: false,
  published: false,
});

function thumbOf(x: Partial<ArtItem>) {
  const m = x.media?.[0];
  return x.thumb || m?.poster || (m?.type === "image" ? m.src : "");
}

const chipBtn = (on: boolean) =>
  `inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition ${
    on ? "border-transparent bg-accent text-accent-ink" : "border-line text-muted hover:text-fg"
  }`;

export function ArtManager() {
  const { content, storage, toast } = useAdmin();
  const [items, setItems] = useState<ArtItem[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [cat, setCat] = useState("all");
  const [vis, setVis] = useState<"all" | "shown" | "hidden">("all");
  const [editing, setEditing] = useState<Partial<ArtItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const disabled = storage ? !storage.writable : true;

  const categories = useMemo(() => content?.art.categories ?? [], [content]);
  const catLabel = useCallback((id: string) => categories.find((c) => c.id === id)?.label ?? id, [categories]);

  const load = useCallback(async () => {
    try {
      const r = await api<{ items: ArtItem[] }>("/api/admin/art");
      setItems(r.items);
      setLoadError("");
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Couldn't load the gallery.");
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const shown = useMemo(
    () =>
      (items ?? []).filter(
        (x) => (cat === "all" || x.category === cat) && (vis === "all" || (vis === "shown" ? x.published : !x.published)),
      ),
    [items, cat, vis],
  );

  const fields: Field[] = useMemo(
    () => [
      { k: "title", label: "Title", type: "text" },
      {
        k: "category",
        label: "Category",
        type: "select",
        half: true,
        options: [
          ...categories.map((c) => ({ value: c.id, label: c.label })),
          ...(editing?.category && !categories.some((c) => c.id === editing.category) ? [{ value: editing.category, label: `${editing.category} (no tab)` }] : []),
        ],
      },
      { k: "date", label: "Posted on", type: "date", half: true },
      { k: "order", label: "Order", type: "number", half: true, help: "Lower shows first. 0 = sort by date." },
      { k: "thumb", label: "Thumbnail (optional)", type: "image", help: "Defaults to the first file's poster or image." },
      { k: "caption", label: "Caption", type: "textarea", rows: 4 },
      {
        k: "media",
        label: "Media files",
        type: "list",
        help: "One file for a reel or photo, several for a carousel. Video: MP4 (H.264) with a poster image.",
        item: [
          { k: "src", label: "Image or video", type: "media" },
          { k: "poster", label: "Poster (for videos)", type: "image" },
          { k: "preview", label: "Hover preview clip (optional)", type: "video" },
        ],
        newItem: () => ({ type: "image", src: "", poster: "", width: 0, height: 0 }),
        titleOf: (m: { src: string }) => (m.src ? decodeURIComponent(m.src.split("/").pop() ?? "").slice(0, 60) : "New file"),
        addLabel: "Add file",
      },
      { k: "featured", label: "Featured (bigger tile)", type: "toggle" },
      { k: "published", label: "Published (shown on the Art page)", type: "toggle" },
    ],
    [categories, editing?.category],
  );

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      const isNew = !editing.id;
      const r = await api<{ item: ArtItem }>(isNew ? "/api/admin/art" : `/api/admin/art/${editing.id}`, {
        method: isNew ? "POST" : "PATCH",
        body: JSON.stringify({ item: editing }),
      });
      setItems((list) => {
        const l = list ?? [];
        return isNew ? [r.item, ...l] : l.map((x) => (x.id === r.item.id ? r.item : x));
      });
      setEditing(null);
      toast("Saved. The Art page updates on the next visit.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function patch(id: string, change: Partial<ArtItem>) {
    const r = await api<{ item: ArtItem }>(`/api/admin/art/${id}`, { method: "PATCH", body: JSON.stringify({ item: change }) });
    setItems((l) => (l ?? []).map((x) => (x.id === id ? r.item : x)));
  }

  async function remove(x: Partial<ArtItem>) {
    if (!x.id || !confirm(`Delete "${x.title || "this item"}"? The files stay in storage.`)) return;
    try {
      await api(`/api/admin/art/${x.id}`, { method: "DELETE" });
      setItems((l) => (l ?? []).filter((i) => i.id !== x.id));
      setEditing(null);
      toast("Deleted.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Delete failed.", "error");
    }
  }

  async function bulk(change: Partial<ArtItem>) {
    setBulkBusy(true);
    try {
      for (const id of selected) await patch(id, change);
      toast(`Updated ${selected.size} item${selected.size === 1 ? "" : "s"}.`);
      setSelected(new Set());
    } catch (e) {
      toast(e instanceof Error ? e.message : "Update failed.", "error");
    } finally {
      setBulkBusy(false);
    }
  }

  const toggleSel = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div>
      <PageTitle
        title="Art gallery"
        intro="Reels, photos and carousels on the Art page. Imported Instagram posts arrive hidden: check them, then publish. Tap a tile to edit it."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" className={chipBtn(false)} onClick={() => setEditing(blank(categories[0]?.id ?? "reels"))} disabled={disabled}>
          <Plus className="h-4 w-4" aria-hidden /> Add item
        </button>
        <span className="text-sm text-subtle">
          {items ? `${items.length} items · ${items.filter((x) => x.published).length} published` : ""}
        </span>
      </div>

      <div className="no-scrollbar -mx-3 mb-3 flex gap-2 overflow-x-auto px-3 pb-1" role="tablist" aria-label="Category">
        {[{ id: "all", label: "All" }, ...categories].map((c) => (
          <button key={c.id} type="button" role="tab" aria-selected={cat === c.id} className={chipBtn(cat === c.id)} onClick={() => setCat(c.id)}>
            {c.label}
            <span className="tabular-nums opacity-70">{(items ?? []).filter((x) => c.id === "all" || x.category === c.id).length}</span>
          </button>
        ))}
      </div>
      <div className="mb-5 flex gap-2" role="group" aria-label="Visibility">
        {(["all", "shown", "hidden"] as const).map((v) => (
          <button key={v} type="button" aria-pressed={vis === v} className={chipBtn(vis === v)} onClick={() => setVis(v)}>
            {v === "all" ? "Any" : v === "shown" ? "Published" : "Hidden"}
          </button>
        ))}
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-[#b42318]/30 bg-[#b42318]/10 px-4 py-3 text-sm">{loadError}</div>
      ) : !items ? (
        <div className="glass flex items-center gap-3 rounded-2xl p-6 text-muted">
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden /> Loading…
        </div>
      ) : shown.length === 0 ? (
        <div className="glass rounded-2xl p-6 text-muted">
          {items.length === 0 ? (
            <>
              Nothing here yet. Add an item, or bulk import an Instagram export with <code>node scripts/import-instagram.mjs</code> (see HOW_TO_RUN.md).
            </>
          ) : (
            "No items match this filter."
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {shown.map((x) => {
            const t = thumbOf(x);
            const isSel = selected.has(x.id);
            const video = x.media.some((m) => m.type === "video");
            return (
              <li key={x.id} className={`glass relative overflow-hidden rounded-2xl ${x.published ? "" : "opacity-80"} ${isSel ? "ring-2 ring-accent" : ""}`}>
                <button type="button" onClick={() => setEditing(structuredClone(x))} className="block w-full text-left" aria-label={`Edit ${x.title || "item"}`}>
                  <span className="relative block aspect-square bg-[var(--glass-strong)]">
                    {t ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-subtle">
                        {video ? <Film className="h-7 w-7" /> : <Images className="h-7 w-7" />}
                      </span>
                    )}
                    <span className="absolute bottom-2 left-2 flex gap-1">
                      {video ? <span className="chip !bg-black/60 !py-0.5 !text-xs !text-white">Video</span> : null}
                      {x.media.length > 1 ? <span className="chip !bg-black/60 !py-0.5 !text-xs !text-white">{x.media.length}</span> : null}
                      {!x.published ? <span className="chip !bg-black/60 !py-0.5 !text-xs !text-white">Hidden</span> : null}
                    </span>
                    {x.featured ? <Star className="absolute right-2 bottom-2 h-4 w-4 fill-current text-amber-400" aria-label="Featured" /> : null}
                  </span>
                  <span className="block p-3">
                    <span className="block truncate text-sm font-medium">{x.title || x.caption.slice(0, 60) || "Untitled"}</span>
                    <span className="block truncate text-xs text-subtle">
                      {catLabel(x.category)} · {x.date || "no date"}
                    </span>
                  </span>
                </button>
                <span className="absolute top-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => void patch(x.id, { published: !x.published }).catch((e) => toast(e.message, "error"))}
                    disabled={disabled}
                    aria-label={x.published ? "Hide on site" : "Show on site"}
                    title={x.published ? "Visible: click to hide" : "Hidden: click to show"}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur"
                  >
                    {x.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => toggleSel(x.id)}
                  aria-pressed={isSel}
                  aria-label={isSel ? "Unselect" : "Select"}
                  className={`absolute top-2 left-2 inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur ${isSel ? "bg-accent text-accent-ink" : "bg-black/55 text-white/80"}`}
                >
                  <Check className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selected.size > 0 ? (
        <div className="sticky bottom-3 z-30 mt-6">
          <div className="glass glass-strong flex flex-wrap items-center gap-2 rounded-2xl p-2 pl-4">
            <p className="mr-auto text-sm text-muted">{selected.size} selected</p>
            {bulkBusy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
            <button type="button" disabled={bulkBusy || disabled} onClick={() => void bulk({ published: true })} className={chipBtn(false)}>
              <Eye className="h-4 w-4" /> Publish
            </button>
            <button type="button" disabled={bulkBusy || disabled} onClick={() => void bulk({ published: false })} className={chipBtn(false)}>
              <EyeOff className="h-4 w-4" /> Hide
            </button>
            <select
              aria-label="Move selected to category"
              disabled={bulkBusy || disabled}
              value=""
              onChange={(e) => e.target.value && void bulk({ category: e.target.value })}
              className="h-10 rounded-full border border-line bg-transparent px-3 text-sm"
            >
              <option value="">Category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => setSelected(new Set())} className={chipBtn(false)}>
              Clear
            </button>
          </div>
        </div>
      ) : null}

      {editing ? (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={editing.id ? "Edit art item" : "New art item"}>
          <button className="absolute inset-0 bg-black/40" aria-label="Close" onClick={() => setEditing(null)} />
          <div className="admin glass glass-strong absolute inset-x-2 top-2 bottom-2 flex flex-col overflow-hidden rounded-[1.6rem] sm:inset-x-auto sm:right-2 sm:w-[min(40rem,calc(100vw-1rem))]">
            <div className="flex items-center justify-between gap-2 border-b border-line p-2 pl-5">
              <h2 className="truncate text-lg font-medium">{editing.id ? "Edit item" : "New item"}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="inline-flex h-11 w-11 items-center justify-center rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6" data-lenis-prevent>
              {editing.source === "instagram" ? (
                <p className="mb-4 rounded-xl border border-line px-3.5 py-2.5 text-xs text-subtle">
                  Imported from Instagram{editing.account ? ` (@${editing.account})` : ""}.
                </p>
              ) : null}
              <ObjectForm key={editing.id ?? "new"} fields={fields} value={editing} onChange={(v: any) => setEditing(v)} />
            </div>
            <div className="flex items-center gap-2 border-t border-line p-2">
              {editing.id ? (
                <button type="button" onClick={() => void remove(editing)} className="inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium text-muted hover:text-fg">
                  <Trash className="h-4 w-4" /> Delete
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving || disabled}
                className="ml-auto inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-accent-ink transition hover:brightness-110 disabled:opacity-50"
              >
                {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
