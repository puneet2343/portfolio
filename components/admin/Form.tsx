"use client";

import { ChevronDown, ChevronUp, Eye, EyeOff, Plus, Star, Trash } from "lucide-react";
import { useState } from "react";
import { ColorInput, LinesInput, MediaInput, SelectInput, TagsInput, TextArea, TextInput, Toggle } from "./fields";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Field =
  | { k: string; label: string; type: "text" | "email" | "url"; help?: string; placeholder?: string; half?: boolean }
  | { k: string; label: string; type: "textarea"; help?: string; rows?: number }
  | { k: string; label: string; type: "lines" | "paragraphs"; help?: string }
  | { k: string; label: string; type: "tags"; help?: string; half?: boolean }
  | { k: string; label: string; type: "toggle"; help?: string }
  | { k: string; label: string; type: "color"; help?: string; half?: boolean }
  | { k: string; label: string; type: "image" | "pdf" | "video"; help?: string }
  | { k: string; label: string; type: "select"; options: { value: string; label: string }[]; half?: boolean }
  | { k: string; label: string; type: "list"; item: Field[]; newItem: () => any; titleOf: (x: any) => string; addLabel: string; help?: string };

export function ObjectForm({ fields, value, onChange }: { fields: Field[]; value: any; onChange: (v: any) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const full = !("half" in f && f.half);
        const v = value?.[f.k];
        let el: React.ReactNode;
        switch (f.type) {
          case "text":
          case "email":
          case "url":
            el = <TextInput label={f.label} help={f.help} type={f.type} placeholder={f.placeholder} value={v ?? ""} onChange={(x) => set(f.k, x)} />;
            break;
          case "textarea":
            el = <TextArea label={f.label} help={f.help} rows={f.rows} value={v ?? ""} onChange={(x) => set(f.k, x)} />;
            break;
          case "lines":
          case "paragraphs":
            el = <LinesInput label={f.label} help={f.help} paragraphs={f.type === "paragraphs"} value={v ?? []} onChange={(x) => set(f.k, x)} />;
            break;
          case "tags":
            el = <TagsInput label={f.label} help={f.help} value={v ?? []} onChange={(x) => set(f.k, x)} />;
            break;
          case "toggle":
            el = <Toggle label={f.label} help={f.help} value={Boolean(v)} onChange={(x) => set(f.k, x)} />;
            break;
          case "color":
            el = <ColorInput label={f.label} help={f.help} value={v ?? "#000000"} onChange={(x) => set(f.k, x)} />;
            break;
          case "image":
          case "pdf":
          case "video":
            el = <MediaInput label={f.label} help={f.help} accept={f.type} value={v ?? ""} onChange={(x) => set(f.k, x)} />;
            break;
          case "select":
            el = <SelectInput label={f.label} options={f.options} value={v ?? ""} onChange={(x) => set(f.k, x)} />;
            break;
          case "list":
            el = (
              <div>
                <p className="mb-1.5 text-sm font-medium">{f.label}</p>
                {f.help ? <p className="mb-2 text-xs text-subtle">{f.help}</p> : null}
                <ListForm nested item={f.item} newItem={f.newItem} titleOf={f.titleOf} addLabel={f.addLabel} value={v ?? []} onChange={(x) => set(f.k, x)} />
              </div>
            );
            break;
        }
        return (
          <div key={f.k} className={full ? "sm:col-span-2" : undefined}>
            {el}
          </div>
        );
      })}
    </div>
  );
}

const iconBtn =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-[var(--glass-strong)] hover:text-fg disabled:opacity-30";

export function ListForm({
  item,
  newItem,
  titleOf,
  addLabel,
  value,
  onChange,
  nested,
}: {
  item: Field[];
  newItem: () => any;
  titleOf: (x: any) => string;
  addLabel: string;
  value: any[];
  onChange: (v: any[]) => void;
  nested?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(nested ? null : null);
  const hasPublished = value.some((x) => typeof x === "object" && x && "published" in x) || "published" in (newItem() ?? {});
  const hasFeatured = "featured" in (newItem() ?? {});

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    if (open === i) setOpen(j);
  };
  const update = (i: number, v: any) => onChange(value.map((x, idx) => (idx === i ? v : x)));

  return (
    <div className="space-y-2.5">
      {value.map((x, i) => {
        const isOpen = open === i;
        const hidden = hasPublished && x.published === false;
        return (
          <div key={x.id ?? i} className={`rounded-2xl border border-line ${nested ? "bg-[var(--glass)]" : "glass"} ${hidden ? "opacity-80" : ""}`}>
            <div className="flex items-center gap-1 p-1.5 pl-3">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex min-h-10 min-w-0 flex-1 items-center gap-2 text-left"
              >
                <span className="truncate font-medium">{titleOf(x) || "Untitled"}</span>
                {hidden ? <span className="chip shrink-0 !py-0.5 !text-xs">Hidden</span> : null}
                {hasFeatured && x.featured ? <Star className="h-4 w-4 shrink-0 text-accent" aria-label="Featured" /> : null}
              </button>
              <div className="flex shrink-0 items-center">
                {hasPublished ? (
                  <button
                    type="button"
                    className={iconBtn}
                    onClick={() => update(i, { ...x, published: !x.published })}
                    aria-label={x.published ? "Hide on site" : "Show on site"}
                    title={x.published ? "Visible: click to hide" : "Hidden: click to show"}
                  >
                    {x.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                ) : null}
                <button type="button" className={`${iconBtn} max-sm:!hidden`} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={`${iconBtn} max-sm:!hidden`}
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={iconBtn}
                  onClick={() => {
                    if (confirm(`Delete "${titleOf(x) || "this item"}"?`)) {
                      onChange(value.filter((_, idx) => idx !== i));
                      setOpen(null);
                    }
                  }}
                  aria-label="Delete"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
            {isOpen ? (
              <div className="border-t border-line p-3.5 sm:p-5">
                <div className="mb-4 flex gap-2 sm:!hidden">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="chip disabled:opacity-40">
                    <ChevronUp className="h-3.5 w-3.5" /> Move up
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="chip disabled:opacity-40">
                    <ChevronDown className="h-3.5 w-3.5" /> Move down
                  </button>
                </div>
                <ObjectForm fields={item} value={x} onChange={(v) => update(i, v)} />
              </div>
            ) : null}
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => {
          onChange([...value, newItem()]);
          setOpen(value.length);
        }}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-dashed border-line px-4 text-sm font-medium text-muted transition hover:text-fg"
      >
        <Plus className="h-4 w-4" aria-hidden /> {addLabel}
      </button>
    </div>
  );
}
