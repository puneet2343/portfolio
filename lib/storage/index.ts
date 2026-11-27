import "server-only";
import { seedContent } from "../seed";
import { buildStats, memoryHit, memoryPeek, withDefaults } from "./shared";
import { ReadOnlyError, type Store } from "./types";

export { ReadOnlyError } from "./types";
export type { Store } from "./types";

/** Production without a database: serve the bundled seed content, refuse writes politely. */
const readOnlyStore: Store = {
  kind: "readonly",
  writable: false,
  async getContent() {
    return withDefaults(seedContent);
  },
  async saveContent() {
    throw new ReadOnlyError();
  },
  async listMessages() {
    return [];
  },
  async addMessage() {
    throw new ReadOnlyError();
  },
  async setMessageRead() {
    throw new ReadOnlyError();
  },
  async deleteMessage() {
    throw new ReadOnlyError();
  },
  async recordView() {
    /* nothing to record into */
  },
  async getViews(days) {
    return buildStats({}, days);
  },
  async hit(key, windowMs) {
    return memoryHit(key, windowMs);
  },
  async peek(key) {
    return memoryPeek(key);
  },
};

let cached: Promise<Store> | undefined;

/**
 * Pick the storage backend from the environment:
 *  - MONGODB_URI set            -> MongoDB
 *  - running on Vercel, no DB   -> read-only (seed content)
 *  - otherwise (local dev)      -> JSON files in ./data
 */
export function getStore(): Promise<Store> {
  if (!cached) {
    cached = (async () => {
      if (process.env.MONGODB_URI) return (await import("./mongo")).mongoStore;
      if (process.env.VERCEL) return readOnlyStore;
      return (await import("./file")).fileStore;
    })();
  }
  return cached;
}

export function uploadsEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN) || !process.env.VERCEL;
}
