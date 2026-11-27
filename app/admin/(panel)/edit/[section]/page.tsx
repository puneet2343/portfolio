import { notFound, redirect } from "next/navigation";
import { SectionEditor } from "@/components/admin/Editor";
import { EDITORS } from "@/components/admin/schemas";
import { isAdmin } from "@/lib/auth";

export default async function EditPage({ params }: PageProps<"/admin/edit/[section]">) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { section } = await params;
  if (!(section in EDITORS) && section !== "sections" && section !== "resume") notFound();
  return <SectionEditor section={section} />;
}
