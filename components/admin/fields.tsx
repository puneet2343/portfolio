"use client";

import { FileText, LoaderCircle, Upload } from "lucide-react";
import { useId, useRef, useState } from "react";
import { api, useAdmin } from "./AdminProvider";

export const inputCls =
  "block w-full rounded-xl border border-line bg-[var(--glass-strong)] px-3.5 py-2.5 text-base text-fg placeholder:text-subtle outline-none transition focus:border-accent focus:ring-2 focus:ring-[color-mix(in_oklab,var(--accent)_25%,transparent)]";

export function Label({ htmlFor, label, help }: { htmlFor: string; label: string; help?: string }) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {help ? <p className="text-xs text-subtle">{help}</p> : null}
    </div>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  help,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  help?: string;
  type?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} label={label} help={help} />
      <input id={id} type={type} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  help,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  help?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} label={label} help={help} />
      <textarea id={id} rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${inputCls} resize-y leading-relaxed`} />
    </div>
  );
}

/** Array of strings edited as one item per line (or per blank-line-separated paragraph). */
export function LinesInput({
  label,
  value,
  onChange,
  help,
  paragraphs,
  rows,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  help?: string;
  paragraphs?: boolean;
  rows?: number;
}) {
  const sep = paragraphs ? "\n\n" : "\n";
  const [text, setText] = useState(() => (value ?? []).join(sep));
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} label={label} help={help ?? (paragraphs ? "Leave an empty line between paragraphs." : "One item per line.")} />
      <textarea
        id={id}
        rows={rows ?? Math.min(12, Math.max(3, (value?.length ?? 0) * (paragraphs ? 3 : 1) + 1))}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const parts = (paragraphs ? e.target.value.split(/\n\s*\n/) : e.target.value.split("\n")).map((s) => s.trim()).filter(Boolean);
          onChange(parts);
        }}
        className={`${inputCls} resize-y leading-relaxed`}
      />
    </div>
  );
}

/** Comma-separated tags. */
export function TagsInput({ label, value, onChange, help }: { label: string; value: string[]; onChange: (v: string[]) => void; help?: string }) {
  const [text, setText] = useState(() => (value ?? []).join(", "));
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} label={label} help={help ?? "Separate with commas."} />
      <input
        id={id}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(
            e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          );
        }}
        className={inputCls}
      />
    </div>
  );
}

export function Toggle({ label, value, onChange, help }: { label: string; value: boolean; onChange: (v: boolean) => void; help?: string }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-line px-3.5 py-3">
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {help ? <p className="text-xs text-subtle">{help}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${value ? "bg-accent" : "bg-[color-mix(in_oklab,var(--fg)_18%,transparent)]"}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${value ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} label={label} />
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ColorInput({ label, value, onChange, help }: { label: string; value: string; onChange: (v: string) => void; help?: string }) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} label={label} help={help} />
      <div className="flex items-center gap-3">
        <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-line bg-transparent" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} max-w-[9rem] font-mono`} aria-label={`${label} hex`} />
      </div>
    </div>
  );
}

/** URL field with an upload button (images or PDF). */
export function MediaInput({
  label,
  value,
  onChange,
  accept = "image",
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accept?: "image" | "pdf" | "video";
  help?: string;
}) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState<number | null>(null);
  const { storage, toast } = useAdmin();
  const canUpload = storage?.uploads ?? false;

  async function upload(file: File) {
    setBusy(true);
    try {
      if (accept === "video") {
        // Large files go straight from the browser to Vercel Blob (token issued by /api/admin/blob).
        const { upload: blobUpload } = await import("@vercel/blob/client");
        const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60);
        const res = await blobUpload(`portfolio/films/${safe}`, file, {
          access: "public",
          handleUploadUrl: "/api/admin/blob",
          contentType: file.type || "video/webm",
          multipart: file.size > 20 * 1024 * 1024,
          onUploadProgress: (e) => setPct(Math.round(e.percentage)),
        });
        onChange(res.url);
        toast("Video uploaded. Remember to save.");
        return;
      }
      const fd = new FormData();
      fd.append("file", file);
      fd.append("accept", accept);
      const { url } = await api<{ url: string }>("/api/admin/upload", { method: "POST", body: fd });
      onChange(url);
      toast("Uploaded. Remember to save.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed.", "error");
    } finally {
      setBusy(false);
      setPct(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <Label htmlFor={id} label={label} help={help} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {value ? (
          accept === "video" ? (
            <video src={value} muted playsInline preload="metadata" className="h-16 w-24 shrink-0 rounded-xl border border-line bg-black object-cover" />
          ) : accept === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-16 w-16 shrink-0 rounded-xl border border-line object-cover" />
          ) : (
            <a href={value} target="_blank" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-line" aria-label="Open file">
              <FileText className="h-6 w-6 text-muted" aria-hidden />
            </a>
          )
        ) : null}
        <input id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={accept === "pdf" ? "/resume/file.pdf or https://…" : accept === "video" ? "/videos/… or https://…" : "/images/… or https://…"} className={inputCls} />
        <input
          ref={fileRef}
          type="file"
          accept={accept === "pdf" ? "application/pdf" : accept === "video" ? "video/webm,video/mp4,video/quicktime" : "image/png,image/jpeg,image/webp,image/gif,image/avif"}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
        <button
          type="button"
          disabled={!canUpload || busy}
          onClick={() => fileRef.current?.click()}
          title={canUpload ? "Upload a file" : "Uploads aren't connected yet"}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-line px-4 text-sm font-medium transition hover:bg-[var(--glass-strong)] disabled:opacity-50"
        >
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
          {pct !== null ? `${pct}%` : "Upload"}
        </button>
      </div>
    </div>
  );
}
