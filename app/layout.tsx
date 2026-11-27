import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import type { CSSProperties } from "react";
import { getContent, siteUrl } from "@/lib/content";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
  display: "swap",
});
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  const url = siteUrl(c);
  return {
    metadataBase: new URL(url),
    title: { default: c.seo.title, template: `%s · ${c.profile.name}` },
    description: c.seo.description,
    keywords: c.seo.keywords,
    authors: [{ name: c.profile.name, url }],
    creator: c.profile.name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url,
      siteName: c.profile.name,
      title: c.seo.title,
      description: c.seo.description,
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title: c.seo.title, description: c.seo.description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ed" },
    { media: "(prefers-color-scheme: dark)", color: "#171411" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const c = await getContent();
  const mode = c.theme.defaultMode === "dark" ? "dark" : "light";
  const style = { "--brand": c.theme.accent, "--brand-2": c.theme.accent2 } as CSSProperties;
  // Runs before first paint: apply the visitor's saved theme (or the site default) without a flash.
  const themeScript = `(function(){try{var t=localStorage.getItem("theme");document.documentElement.setAttribute("data-theme",t==="dark"||t==="light"?t:"${mode}")}catch(e){}})()`;

  return (
    <html
      lang="en"
      data-theme={mode}
      style={style}
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
