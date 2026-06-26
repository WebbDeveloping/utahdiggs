import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/admin-auth";

export default async function AdminPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/crm");
  }

  redirect("/crm/login");
}
