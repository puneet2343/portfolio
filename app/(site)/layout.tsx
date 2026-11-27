import { Footer } from "@/components/site/Contact";
import { Header } from "@/components/site/Header";
import SmoothScroll from "@/components/site/SmoothScroll";
import { Tracker } from "@/components/site/Tracker";
import { getPublicContent } from "@/lib/content";
import { navItems } from "@/lib/site-data";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const c = await getPublicContent();

  return (
    <div id="top" className="site">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-20 focus:z-[90] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <Header name={c.profile.name} nav={navItems(c)} resumeUrl={c.profile.resumeUrl} />
      <main id="main">{children}</main>
      <Footer c={c} />
      <Tracker />
    </div>
  );
}
