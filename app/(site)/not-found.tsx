import Link from "next/link";
import { Container } from "@/components/site/bits";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-start justify-center pt-24">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-5xl font-medium">This page isn&apos;t here.</h1>
      <p className="mt-4 max-w-md text-muted">The link may be old, or the project was moved.</p>
      <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-accent px-6 font-medium text-accent-ink">
        Go to the home page
      </Link>
    </Container>
  );
}
