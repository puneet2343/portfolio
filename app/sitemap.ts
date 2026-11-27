import type { MetadataRoute } from "next";
import { getPublicContent, siteUrl } from "@/lib/content";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const c = await getPublicContent();
  const url = siteUrl(c);
  const updated = new Date(c.updatedAt);
  return [
    { url, lastModified: updated, changeFrequency: "monthly", priority: 1 },
    ...c.projects.map((p) => ({
      url: `${url}/projects/${p.slug}`,
      lastModified: updated,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
