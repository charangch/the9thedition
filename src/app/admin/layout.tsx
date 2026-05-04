import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminSession();
  if (!admin) {
    redirect("/login?next=/admin");
  }

  return children;
}
