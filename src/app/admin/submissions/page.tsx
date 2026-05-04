import { redirect } from "next/navigation";

/** Publishing management has been removed from the admin workspace. */
export default function AdminSubmissionsPage() {
  redirect("/admin");
}
