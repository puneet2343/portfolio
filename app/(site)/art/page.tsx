import type { Metadata } from "next";
import { ArtCinema, type CinemaItem } from "@/components/site/ArtCinema";
import { FilmsSection } from "@/components/site/FilmsSection";
import { getPublicArt, getPublicContent } from "@/lib/content";

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getPublicContent();
  return {
    title: "Art",
    description: `Short films, travel reels and photographs by ${c.profile.name}.`,
    alternates: { canonical: "/art" },
  };
}

export default async function ArtPage() {
  const [c, art] = await Promise.all([getPublicContent(), getPublicArt()]);
  const s = c.art;
  // Titles only: no dates or long captions on the Art side.
  const items: CinemaItem[] = art.map((x) => ({ id: x.id, title: x.title, category: x.category, media: x.media, thumb: x.thumb }));

  return (
    // The Art side is a dark theatre in both themes.
    <div className="force-dark bg-black text-white">
      <ArtCinema
        kicker={s.kicker}
        heading={s.heading}
        accent={s.headingAccent}
        intro={s.intro}
        heroVideo={s.heroVideo}
        heroPoster={s.heroPoster}
        galleryHeading={s.galleryHeading}
        galleryIntro={s.galleryIntro}
        instagramUrl={s.instagramUrl}
        categories={s.categories}
        items={items}
      />
      <FilmsSection c={c} />
    </div>
  );
}
