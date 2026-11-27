import type { MetadataRoute } from "next";
import { getContent, siteUrl } from "@/lib/content";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const url = siteUrl(await getContent());
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}
