import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FilmsSection } from "@/components/site/FilmsSection";
import { getPublicContent } from "@/lib/content";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getPublicContent();
  return {
    title: "Films",
    description: `${c.beyond.heading} ${c.beyond.headingAccent}: short films shot and edited by ${c.profile.name}.`,
    alternates: { canonical: "/films" },
  };
}

export default async function FilmsPage() {
  const c = await getPublicContent();
  if (!c.beyond.items.length) notFound();
  return (
    <div className="pt-16">
      <FilmsSection c={c} headingLevel="h1" />
    </div>
  );
}
