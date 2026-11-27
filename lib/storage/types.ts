import type { Message, SiteContent, ViewStats } from "../types";

export type StoreKind = "file" | "mongo" | "readonly";

export interface Store {
  kind: StoreKind;
  /** false when nothing can be persisted (e.g. production without MONGODB_URI) */
  writable: boolean;
  getContent(): Promise<SiteContent>;
  saveContent(content: SiteContent): Promise<void>;
  listMessages(): Promise<Message[]>;
  addMessage(message: Message): Promise<void>;
  setMessageRead(id: string, read: boolean): Promise<boolean>;
  deleteMessage(id: string): Promise<boolean>;
  recordView(path: string): Promise<void>;
  getViews(days: number): Promise<ViewStats>;
  /** Fixed-window counter used for rate limiting. Returns the count for this window, including this hit. */
  hit(key: string, windowMs: number): Promise<number>;
  /** Current count for this window without incrementing. */
  peek(key: string, windowMs: number): Promise<number>;
}

export class ReadOnlyError extends Error {
  constructor() {
    super("Storage not connected: changes can't be saved.");
    this.name = "ReadOnlyError";
  }
}
