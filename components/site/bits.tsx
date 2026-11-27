import Image from "next/image";
import type { ReactNode } from "react";
import type { SocialIcon } from "@/lib/types";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function Section({
  id,
  title,
  kicker,
  children,
  className = "",
}: {
  id: string;
  title: string;
  kicker?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`py-16 sm:py-24 ${className}`}>
      <Container>
        <header className="mb-8 sm:mb-12">
          {kicker ? <p className="eyebrow mb-3">{kicker}</p> : null}
          <h2 id={`${id}-title`} className="text-[2.1rem] leading-tight font-medium sm:text-5xl">
            {title}
          </h2>
        </header>
        {children}
      </Container>
    </section>
  );
}

export function Chips({ items, max }: { items: string[]; max?: number }) {
  const list = max ? items.slice(0, max) : items;
  const more = max && items.length > max ? items.length - max : 0;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
      {list.map((t) => (
        <li key={t} className="chip">
          {t}
        </li>
      ))}
      {more ? <li className="chip">+{more}</li> : null}
    </ul>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((p, i) => (
        <li key={i} className="relative pl-5 text-[0.97rem] leading-relaxed text-muted">
          <span aria-hidden className="absolute left-0 top-[0.62em] h-1.5 w-1.5 rounded-full bg-accent/80" />
          {p}
        </li>
      ))}
    </ul>
  );
}

/** next/image for local + Blob images; uploads served by our own route skip the optimizer. */
export function Photo({
  src,
  alt,
  className = "",
  sizes,
  priority,
  position,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  position?: string;
}) {
  if (!src) return null;
  const unoptimized = src.startsWith("/media/") || src.endsWith(".svg");
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      className={`object-cover ${className}`}
      style={position ? { objectPosition: position } : undefined}
    />
  );
}

export function SocialGlyph({ icon, className = "h-5 w-5" }: { icon: SocialIcon; className?: string }) {
  const common = { className, "aria-hidden": true, viewBox: "0 0 24 24", fill: "currentColor" } as const;
  switch (icon) {
    case "github":
      return (
        <svg {...common}>
          <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
        </svg>
      );
    case "email":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
  }
}
