import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/admin-auth";
import CrmShell from "@/components/crm/CrmShell";

export default async function CrmProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/crm/login");
  }

  return <CrmShell user={session.user}>{children}</CrmShell>;
}
