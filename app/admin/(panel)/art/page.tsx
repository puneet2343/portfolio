import { redirect } from "next/navigation";
import { ArtManager } from "@/components/admin/ArtManager";
import { isAdmin } from "@/lib/auth";

export default async function ArtAdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <ArtManager />;
}
