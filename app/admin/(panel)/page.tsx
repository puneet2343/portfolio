import { redirect } from "next/navigation";
import { Dashboard } from "@/components/admin/Dashboard";
import { isAdmin } from "@/lib/auth";

export default async function AdminHome() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <Dashboard />;
}
