import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
