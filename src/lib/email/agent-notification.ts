import { prisma } from "@/lib/db";
import { AGENT_EMAIL } from "@/lib/seo/site";

export function defaultAgentNotificationEmail(): string {
  return process.env.AGENT_NOTIFICATION_EMAIL ?? AGENT_EMAIL;
}

export async function resolveAgentNotificationEmail(
  listingId?: string | null,
): Promise<string> {
  if (!listingId) {
    return defaultAgentNotificationEmail();
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      assignedAgent: {
        select: { email: true, active: true },
      },
    },
  });

  if (listing?.assignedAgent?.active && listing.assignedAgent.email) {
    return listing.assignedAgent.email;
  }

  return defaultAgentNotificationEmail();
}
