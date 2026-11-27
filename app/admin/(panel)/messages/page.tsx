import { redirect } from "next/navigation";
import { Inbox } from "@/components/admin/Inbox";
import { isAdmin } from "@/lib/auth";

export default async function MessagesPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <Inbox />;
}
