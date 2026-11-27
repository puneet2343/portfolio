import { promises as fs } from "node:fs";
import path from "node:path";
import type { Message, SiteContent } from "../types";
import { buildStats, encodePathKey, memoryHit, memoryPeek, today, withDefaults } from "./shared";
import type { Store } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT = path.join(DATA_DIR, "content.json");
const MESSAGES = path.join(DATA_DIR, "messages.json");
const VIEWS = path.join(DATA_DIR, "views.json");

type ViewsFile = Record<string, { total: number; paths: Record<string, number> }>;

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  try {
    await fs.rename(tmp, file);
  } catch {
    // Windows can refuse the rename if the target is briefly locked; fall back to a direct write.
    await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
    await fs.rm(tmp, { force: true });
  }
}

/** Serialise writes per file so concurrent requests can't lose updates. */
const queues = new Map<string, Promise<unknown>>();
function locked<T>(file: string, fn: () => Promise<T>): Promise<T> {
  const prev = queues.get(file) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  queues.set(
    file,
    next.catch(() => undefined),
  );
  return next;
}

export const fileStore: Store = {
  kind: "file",
  writable: true,

  async getContent() {
    return withDefaults(await readJson<Partial<SiteContent> | null>(CONTENT, null));
  },
  async saveContent(content) {
    await locked(CONTENT, () => writeJson(CONTENT, content));
  },

  async listMessages() {
    const list = await readJson<Message[]>(MESSAGES, []);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async addMessage(message) {
    await locked(MESSAGES, async () => {
      const list = await readJson<Message[]>(MESSAGES, []);
      list.push(message);
      await writeJson(MESSAGES, list.slice(-2000));
    });
  },
  async setMessageRead(id, read) {
    return locked(MESSAGES, async () => {
      const list = await readJson<Message[]>(MESSAGES, []);
      const m = list.find((x) => x.id === id);
      if (!m) return false;
      m.read = read;
      await writeJson(MESSAGES, list);
      return true;
    });
  },
  async deleteMessage(id) {
    return locked(MESSAGES, async () => {
      const list = await readJson<Message[]>(MESSAGES, []);
      const next = list.filter((x) => x.id !== id);
      if (next.length === list.length) return false;
      await writeJson(MESSAGES, next);
      return true;
    });
  },

  async recordView(p) {
    await locked(VIEWS, async () => {
      const views = await readJson<ViewsFile>(VIEWS, {});
      const d = today();
      const day = (views[d] ??= { total: 0, paths: {} });
      day.total += 1;
      const key = encodePathKey(p);
      day.paths[key] = (day.paths[key] ?? 0) + 1;
      await writeJson(VIEWS, views);
    });
  },
  async getViews(days) {
    return buildStats(await readJson<ViewsFile>(VIEWS, {}), days);
  },

  async hit(key, windowMs) {
    return memoryHit(key, windowMs);
  },
  async peek(key) {
    return memoryPeek(key);
  },
};
