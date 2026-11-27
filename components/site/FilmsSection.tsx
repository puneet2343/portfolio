import type { SiteContent } from "@/lib/types";
import { FilmBlock, FilmsIntro } from "./Films";

/** "Beyond the Code": intro + one full-screen block per film. */
export function FilmsSection({ c, headingLevel = "h2" }: { c: SiteContent; headingLevel?: "h1" | "h2" }) {
  if (!c.beyond.items.length) return null;
  return (
    <>
      <FilmsIntro kicker={c.beyond.kicker} heading={c.beyond.heading} accent={c.beyond.headingAccent} intro={c.beyond.intro} as={headingLevel} />
      {c.beyond.items.map((f, i) => (
        <FilmBlock key={f.id} film={f} index={i} directedBy={c.profile.name} />
      ))}
    </>
  );
}
