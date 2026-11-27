"use client";

import { LoaderCircle, Mail, MailOpen, Reply, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Message } from "@/lib/types";
import { api, useAdmin } from "./AdminProvider";
import { PageTitle } from "./Editor";

export function Inbox() {
  const { toast } = useAdmin();
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api<{ messages: Message[] }>("/api/admin/messages");
      setMessages(r.messages);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't load messages.", "error");
      setMessages([]);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setRead(m: Message, read: boolean) {
    setMessages((list) => list?.map((x) => (x.id === m.id ? { ...x, read } : x)) ?? null);
    try {
      await api(`/api/admin/messages/${encodeURIComponent(m.id)}`, { method: "PATCH", body: JSON.stringify({ read }) });
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't update.", "error");
      void load();
    }
  }

  async function remove(m: Message) {
    if (!confirm(`Delete the message from ${m.name}?`)) return;
    try {
      await api(`/api/admin/messages/${encodeURIComponent(m.id)}`, { method: "DELETE" });
      setMessages((list) => list?.filter((x) => x.id !== m.id) ?? null);
      toast("Message deleted.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't delete.", "error");
    }
  }

  const list = (messages ?? []).filter((m) => (filter === "unread" ? !m.read : true));
  const unread = (messages ?? []).filter((m) => !m.read).length;

  return (
    <div>
      <PageTitle title="Messages" intro="Messages sent through the contact form." />
      <div className="mb-4 flex gap-2" role="tablist" aria-label="Filter">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`h-10 rounded-full px-4 text-sm font-medium transition ${filter === f ? "bg-fg text-bg" : "glass text-muted"}`}
          >
            {f === "all" ? `All (${messages?.length ?? 0})` : `Unread (${unread})`}
          </button>
        ))}
      </div>

      {messages === null ? (
        <div className="glass flex items-center gap-3 rounded-2xl p-6 text-muted">
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden /> Loading…
        </div>
      ) : list.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-muted">{filter === "unread" ? "No unread messages." : "No messages yet."}</div>
      ) : (
        <ul className="space-y-2.5">
          {list.map((m) => {
            const isOpen = open === m.id;
            return (
              <li key={m.id} className={`glass rounded-2xl ${m.read ? "" : "ring-1 ring-[color-mix(in_oklab,var(--accent)_45%,transparent)]"}`}>
                <button
                  type="button"
                  className="flex w-full items-start gap-3 p-4 text-left"
                  aria-expanded={isOpen}
                  onClick={() => {
                    setOpen(isOpen ? null : m.id);
                    if (!m.read) void setRead(m, true);
                  }}
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.read ? "bg-transparent" : "bg-accent"}`} aria-label={m.read ? undefined : "Unread"} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className={`truncate ${m.read ? "" : "font-semibold"}`}>{m.name}</span>
                      <time className="text-xs text-subtle" dateTime={m.createdAt}>
                        {new Date(m.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </time>
                    </span>
                    <span className="block truncate text-sm text-muted">{m.subject || m.body}</span>
                  </span>
                </button>
                {isOpen ? (
                  <div className="border-t border-line px-4 pt-3 pb-4">
                    <p className="text-sm text-muted">
                      From <a className="font-medium text-fg underline-offset-4 hover:underline" href={`mailto:${m.email}`}>{m.email}</a>
                    </p>
                    {m.subject ? <p className="mt-2 font-medium">{m.subject}</p> : null}
                    <p className="mt-2 whitespace-pre-wrap leading-relaxed">{m.body}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "your message"}`)}`}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-accent-ink"
                      >
                        <Reply className="h-4 w-4" aria-hidden /> Reply
                      </a>
                      <button onClick={() => setRead(m, !m.read)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-medium">
                        {m.read ? <Mail className="h-4 w-4" aria-hidden /> : <MailOpen className="h-4 w-4" aria-hidden />}
                        Mark as {m.read ? "unread" : "read"}
                      </button>
                      <button onClick={() => remove(m)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-medium text-[#b42318] dark:text-[#ff9b8f]">
                        <Trash className="h-4 w-4" aria-hidden /> Delete
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
