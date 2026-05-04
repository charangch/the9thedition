import { redirect } from "next/navigation";

/** Publishing / project queue UI has been removed from the admin workspace. */
export default function AdminProjectsPage() {
  redirect("/admin");
}
