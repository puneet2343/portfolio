import { Footer } from "@/components/site/sections";
import { Header, type NavItem } from "@/components/site/Header";
import { Tracker } from "@/components/site/Tracker";
import { getPublicContent } from "@/lib/content";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const c = await getPublicContent();
  const nav: NavItem[] = c.sections
    .filter((s) => s.visible && ["about", "experience", "projects", "skills", "contact"].includes(s.id))
    .map((s) => ({ id: s.id, label: s.label }));

  return (
    <div id="top">
      <div className="backdrop" aria-hidden>
        <span className="b1" />
        <span className="b2" />
        <span className="b3" />
        <span className="b4" />
      </div>
      <Header name={c.profile.name} nav={nav} resumeUrl={c.profile.resumeUrl} />
      <main id="main">{children}</main>
      <Footer c={c} />
      <Tracker />
    </div>
  );
}
