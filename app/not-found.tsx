import Link from "next/link";

export default function NotFound() {
  return (
    <main className="site flex min-h-dvh flex-col items-start justify-center px-6 sm:px-16">
      <p className="font-mono text-xs uppercase tracking-widest text-emerald-500">404</p>
      <h1 className="mt-3 text-5xl font-bold tracking-tighter sm:text-7xl">
        Page not <span className="text-foreground/50">found.</span>
      </h1>
      <p className="mt-5 max-w-md text-foreground/70">The link may be old, or the page was moved.</p>
      <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-foreground px-6 text-sm font-semibold text-background">
        Go to the home page
      </Link>
    </main>
  );
}
