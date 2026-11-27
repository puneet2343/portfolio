import { MongoClient, type Db } from "mongodb";
import type { Message, SiteContent } from "../types";
import { buildStats, encodePathKey, today, withDefaults } from "./shared";
import type { Store } from "./types";

type GlobalWithMongo = typeof globalThis & { __mongoDb?: Promise<Db> };
const g = globalThis as GlobalWithMongo;

function db(): Promise<Db> {
  if (!g.__mongoDb) {
    const uri = process.env.MONGODB_URI as string;
    const client = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000 });
    g.__mongoDb = client
      .connect()
      .then(async (c) => {
        const d = c.db(process.env.MONGODB_DB || "portfolio");
        await Promise.all([
          d.collection("ratelimits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
          d.collection("messages").createIndex({ createdAt: -1 }),
        ]).catch(() => undefined);
        return d;
      })
      .catch((err) => {
        g.__mongoDb = undefined;
        throw err;
      });
  }
  return g.__mongoDb;
}

type ContentDoc = { _id: string; data: SiteContent };
type MessageDoc = Omit<Message, "id"> & { _id: string };
type ViewDoc = { _id: string; total: number; paths: Record<string, number> };
type RateDoc = { _id: string; count: number; expiresAt: Date };

export const mongoStore: Store = {
  kind: "mongo",
  writable: true,

  async getContent() {
    const doc = await (await db()).collection<ContentDoc>("content").findOne({ _id: "site" });
    return withDefaults(doc?.data);
  },
  async saveContent(content) {
    await (await db())
      .collection<ContentDoc>("content")
      .updateOne({ _id: "site" }, { $set: { data: content } }, { upsert: true });
  },

  async listMessages() {
    const docs = await (await db())
      .collection<MessageDoc>("messages")
      .find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();
    return docs.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
  },
  async addMessage(m) {
    const { id, ...rest } = m;
    await (await db()).collection<MessageDoc>("messages").insertOne({ _id: id, ...rest });
  },
  async setMessageRead(id, read) {
    const r = await (await db()).collection<MessageDoc>("messages").updateOne({ _id: id }, { $set: { read } });
    return r.matchedCount > 0;
  },
  async deleteMessage(id) {
    const r = await (await db()).collection<MessageDoc>("messages").deleteOne({ _id: id });
    return r.deletedCount > 0;
  },

  async recordView(p) {
    await (await db())
      .collection<ViewDoc>("views")
      .updateOne({ _id: today() }, { $inc: { total: 1, [`paths.${encodePathKey(p)}`]: 1 } }, { upsert: true });
  },
  async getViews(days) {
    const docs = await (await db()).collection<ViewDoc>("views").find({}).toArray();
    const all: Record<string, { total: number; paths: Record<string, number> }> = {};
    for (const d of docs) all[d._id] = { total: d.total ?? 0, paths: d.paths ?? {} };
    return buildStats(all, days);
  },

  async hit(key, windowMs) {
    const bucket = Math.floor(Date.now() / windowMs);
    const id = `${key}:${bucket}`;
    const doc = await (await db())
      .collection<RateDoc>("ratelimits")
      .findOneAndUpdate(
        { _id: id },
        { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 1) * windowMs) } },
        { upsert: true, returnDocument: "after" },
      );
    return doc?.count ?? 1;
  },
  async peek(key, windowMs) {
    const bucket = Math.floor(Date.now() / windowMs);
    const doc = await (await db()).collection<RateDoc>("ratelimits").findOne({ _id: `${key}:${bucket}` });
    return doc?.count ?? 0;
  },
};
