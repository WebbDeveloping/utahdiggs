import { redirect } from "next/navigation";
import AccountAppShell from "@/components/account/AccountAppShell";
import { getConsumerSession } from "@/lib/auth/consumer-session";

export default async function AccountAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getConsumerSession();

  if (!user) {
    redirect("/login");
  }

  return <AccountAppShell user={user}>{children}</AccountAppShell>;
}
