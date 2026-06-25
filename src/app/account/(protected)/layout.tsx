import { redirect } from "next/navigation";
import { getConsumerSession } from "@/lib/auth/consumer-session";

export default async function AccountProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getConsumerSession();

  if (!user) {
    redirect("/login");
  }

  return children;
}
