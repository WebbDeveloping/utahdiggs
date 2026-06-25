import { auth } from "@/lib/auth/consumer-auth";
import type { ConsumerSessionUser } from "@/lib/auth/consumer-auth";

export async function getConsumerSession(): Promise<ConsumerSessionUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}
