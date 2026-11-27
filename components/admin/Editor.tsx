"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff, LoaderCircle, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ContentKey, SectionSetting, SiteContent } from "@/lib/types";
import { useAdmin } from "./AdminProvider";
import { inputCls, MediaInput } from "./fields";
import { ListForm, ObjectForm } from "./Form";
import { EDITORS } from "./schemas";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function PageTitle({ title, intro }: { title: string; intro?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-medium sm:text-4xl">{title}</h1>
      {intro ? <p className="mt-2 max-w-2xl text-muted">{intro}</p> : null}
    </header>
  );
}

function SaveBar({ dirty, saving, disabled, onSave, onDiscard }: { dirty: boolean; saving: boolean; disabled: boolean; onSave: () => void; onDiscard: () => void }) {
  return (
    <div className="sticky bottom-3 z-30 mt-6">
      <div className="glass glass-strong flex items-center justify-between gap-3 rounded-2xl p-2 pl-4">
        <p className="text-sm text-muted">{disabled ? "Saving is off: storage not connected" : dirty ? "Unsaved changes" : "All changes saved"}</p>
        <div className="flex gap-2">
          {dirty ? (
            <button type="button" onClick={onDiscard} className="h-11 rounded-xl px-4 text-sm font-medium text-muted hover:text-fg">
              Discard
            </button>
          ) : null}
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || saving || disabled}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-accent-ink transition hover:brightness-110 disabled:opacity-50"
          >
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/** Keeps a local draft of one content key and saves it on demand. */
function useDraft<K extends ContentKey>(key: K) {
  const { content, storage, save } = useAdmin();
  const original = content?.[key];
  const [draft, setDraft] = useState<SiteContent[K] | undefined>(original);
  const [version, setVersion] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Sync the draft when content first loads or after a save from elsewhere.
    setDraft(original);
  }, [original]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(original), [draft, original]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return {
    draft,
    setDraft,
    version,
    dirty,
    saving,
    disabled: storage ? !storage.writable : true,
    loaded: content !== null,
    async onSave() {
      if (draft === undefined) return;
      setSaving(true);
      const r = await save(key, draft);
      setSaving(false);
      if (r.ok) setVersion((v) => v + 1);
    },
    onDiscard() {
      setDraft(original);
      setVersion((v) => v + 1);
    },
  };
}

function Loading() {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl p-6 text-muted">
      <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden /> Loading…
    </div>
  );
}

export function SectionEditor({ section }: { section: string }) {
  if (section === "sections") return <SectionsEditor />;
  if (section === "resume") return <ResumeEditor />;
  const def = EDITORS[section];
  return <GenericEditor def={def} />;
}

function GenericEditor({ def }: { def: (typeof EDITORS)[string] }) {
  const d = useDraft(def.key);
  return (
    <div>
      <PageTitle title={def.title} intro={def.intro} />
      {!d.loaded || d.draft === undefined ? (
        <Loading />
      ) : def.kind === "list" ? (
        <ListForm
          key={d.version}
          item={def.fields}
          newItem={def.newItem!}
          titleOf={def.titleOf as (x: any) => string}
          addLabel={def.addLabel!}
          value={d.draft as any[]}
          onChange={(v) => d.setDraft(v as never)}
        />
      ) : (
        <div className="glass rounded-[1.6rem] p-4 sm:p-6">
          <ObjectForm key={d.version} fields={def.fields} value={d.draft} onChange={(v) => d.setDraft(v)} />
        </div>
      )}
      <SaveBar dirty={d.dirty} saving={d.saving} disabled={d.disabled} onSave={d.onSave} onDiscard={d.onDiscard} />
    </div>
  );
}

function SectionsEditor() {
  const d = useDraft("sections");
  const list = (d.draft ?? []) as SectionSetting[];
  const set = (next: SectionSetting[]) => d.setDraft(next);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    set(next);
  };
  return (
    <div>
      <PageTitle title="Sections & order" intro="Show, hide, rename and reorder the sections on the home page. The hero always comes first." />
      {!d.loaded ? (
        <Loading />
      ) : (
        <ol className="space-y-2.5">
          {list.map((s, i) => (
            <li key={s.id} className={`glass flex items-center gap-2 rounded-2xl p-2 pl-3 ${s.visible ? "" : "opacity-75"}`}>
              <span className="w-6 shrink-0 text-sm text-subtle tabular-nums">{i + 1}</span>
              <input
                value={s.label}
                onChange={(e) => set(list.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))}
                className={`${inputCls} !py-2`}
                aria-label={`Label for ${s.id} section`}
              />
              <button
                type="button"
                onClick={() => set(list.map((x, idx) => (idx === i ? { ...x, visible: !x.visible } : x)))}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted hover:text-fg"
                aria-label={s.visible ? `Hide ${s.label}` : `Show ${s.label}`}
                title={s.visible ? "Visible" : "Hidden"}
              >
                {s.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted hover:text-fg disabled:opacity-30" aria-label="Move up">
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === list.length - 1}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted hover:text-fg disabled:opacity-30"
                aria-label="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ol>
      )}
      <SaveBar dirty={d.dirty} saving={d.saving} disabled={d.disabled} onSave={d.onSave} onDiscard={d.onDiscard} />
    </div>
  );
}

function ResumeEditor() {
  const d = useDraft("profile");
  const p = d.draft as SiteContent["profile"] | undefined;
  return (
    <div>
      <PageTitle title="Resume PDF" intro="Upload a new PDF. The Resume buttons on the site download whatever is set here." />
      {!p ? (
        <Loading />
      ) : (
        <div className="glass space-y-4 rounded-[1.6rem] p-4 sm:p-6">
          <MediaInput key={d.version} label="Resume file" accept="pdf" value={p.resumeUrl} onChange={(v) => d.setDraft({ ...p, resumeUrl: v })} help="PDF, up to 10 MB." />
          {p.resumeUrl ? (
            <a href={p.resumeUrl} target="_blank" className="inline-flex text-sm font-medium text-accent underline-offset-4 hover:underline">
              Open current resume
            </a>
          ) : null}
        </div>
      )}
      <SaveBar dirty={d.dirty} saving={d.saving} disabled={d.disabled} onSave={d.onSave} onDiscard={d.onDiscard} />
    </div>
  );
}
