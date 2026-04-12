import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminIndexPage() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  redirect("/admin/cards");
}
