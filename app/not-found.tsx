import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-start justify-center px-6 sm:px-16">
      <div className="backdrop" aria-hidden>
        <span className="b1" />
        <span className="b2" />
        <span className="b3" />
      </div>
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-5xl font-medium">This page isn&apos;t here.</h1>
      <p className="mt-4 max-w-md text-muted">The link may be old, or the page was moved.</p>
      <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-accent px-6 font-medium text-accent-ink">
        Go to the home page
      </Link>
    </main>
  );
}
