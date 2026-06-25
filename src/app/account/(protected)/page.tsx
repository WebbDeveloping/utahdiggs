import type { Metadata } from "next";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import AccountShell from "@/components/account/AccountShell";

export const metadata: Metadata = {
  title: "My account — Glide RE",
};

export default async function AccountPage() {
  const user = await getConsumerSession();

  if (!user) {
    return null;
  }

  return <AccountShell user={user} />;
}
