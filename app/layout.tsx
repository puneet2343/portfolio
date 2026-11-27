import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, Inter } from "next/font/google";
import type { CSSProperties } from "react";
import { getContent, siteUrl } from "@/lib/content";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
  display: "swap",
  // Admin headings only: don't make public pages download it up front.
  preload: false,
});
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap", preload: false });
// Fallback for the Apple system font stack on Windows and Android.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

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
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#02091a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const c = await getContent();
  // Light is the default for every new visitor; their own choice (toggle) is remembered.
  const mode = c.theme.defaultMode === "dark" ? "dark" : "light";
  const style = { "--brand": c.theme.accent, "--brand-2": c.theme.accent2 } as CSSProperties;
  // Runs before first paint: apply the visitor's saved theme (or the site default) without a flash.
  const themeScript = `(function(){var d=document.documentElement,m="${mode}";try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")m=t}catch(e){}d.setAttribute("data-theme",m)})()`;

  return (
    <html
      lang="en"
      data-theme={mode}
      data-theme-default={mode}
      style={style}
      className={`${display.variable} ${body.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Media (posters, art thumbnails) comes from Vercel Blob: open that connection early. */}
        <link rel="preconnect" href="https://o84jhj08pqkv4hu6.public.blob.vercel-storage.com" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
