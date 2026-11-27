import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { authConfigured, isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="backdrop" aria-hidden>
        <span className="b1" />
        <span className="b2" />
        <span className="b3" />
      </div>
      <div className="glass w-full max-w-sm rounded-[1.8rem] p-6 sm:p-8">
        <h1 className="text-3xl font-medium">Sign in</h1>
        <p className="mt-1.5 text-sm text-muted">Site admin</p>
        {authConfigured() ? (
          <LoginForm />
        ) : (
          <p className="mt-6 rounded-xl border border-line p-4 text-sm text-muted">
            Login isn&apos;t configured. Set ADMIN_USERNAME, ADMIN_PASSWORD and SESSION_SECRET.
          </p>
        )}
      </div>
    </main>
  );
}
