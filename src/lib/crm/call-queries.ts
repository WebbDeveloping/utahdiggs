import { prisma } from "@/lib/db";
import { getListingWhereForUser, type CrmSessionUser } from "@/lib/crm/access";
import { formatCallDateOnly, getCallDateString } from "@/lib/consumer/call-datetime";

type UpcomingCallsOptions = {
  from?: Date;
  days?: number;
};

function getUpcomingCallsRange(options: UpcomingCallsOptions = {}) {
  const from = options.from ?? new Date();
  const days = options.days ?? 14;
  const to = new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  return { from, to };
}

const upcomingCallSelect = {
  id: true,
  address: true,
  city: true,
  state: true,
  scheduledCallAt: true,
  callNotes: true,
  assignedAgent: { select: { id: true, name: true, email: true } },
  customer: { select: { name: true, email: true } },
  contacts: {
    where: { role: "PRIMARY" as const },
    take: 1,
    select: { contact: { select: { name: true, email: true } } },
  },
} as const;

export type CrmUpcomingCall = {
  id: string;
  address: string;
  city: string;
  state: string;
  scheduledCallAt: Date;
  callNotes: string | null;
  sellerName: string;
  assignedAgentName: string | null;
};

export async function getUpcomingCallCount(
  user: CrmSessionUser,
  options: UpcomingCallsOptions = {},
): Promise<number> {
  const { from, to } = getUpcomingCallsRange(options);

  return prisma.listing.count({
    where: {
      ...getListingWhereForUser(user),
      scheduledCallAt: { gte: from, lte: to },
    },
  });
}

export async function getUpcomingCalls(
  user: CrmSessionUser,
  options: UpcomingCallsOptions = {},
): Promise<CrmUpcomingCall[]> {
  const { from, to } = getUpcomingCallsRange(options);

  const listings = await prisma.listing.findMany({
    where: {
      ...getListingWhereForUser(user),
      scheduledCallAt: { gte: from, lte: to },
    },
    orderBy: { scheduledCallAt: "asc" },
    select: upcomingCallSelect,
  });

  return listings
    .filter((listing): listing is typeof listing & { scheduledCallAt: Date } =>
      listing.scheduledCallAt != null,
    )
    .map((listing) => ({
      id: listing.id,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      scheduledCallAt: listing.scheduledCallAt,
      callNotes: listing.callNotes,
      sellerName:
        listing.contacts[0]?.contact.name ??
        listing.customer?.name ??
        listing.customer?.email ??
        "Seller",
      assignedAgentName:
        listing.assignedAgent?.name ?? listing.assignedAgent?.email ?? null,
    }));
}

export type CrmUpcomingCallsByDay = {
  dateLabel: string;
  dateKey: string;
  calls: CrmUpcomingCall[];
};

export function groupUpcomingCallsByDay(calls: CrmUpcomingCall[]): CrmUpcomingCallsByDay[] {
  const groups = new Map<string, CrmUpcomingCall[]>();

  for (const call of calls) {
    const dateKey = getCallDateString(call.scheduledCallAt);
    const existing = groups.get(dateKey) ?? [];
    existing.push(call);
    groups.set(dateKey, existing);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, dayCalls]) => ({
      dateKey,
      dateLabel: formatCallDateOnly(dayCalls[0]!.scheduledCallAt),
      calls: dayCalls,
    }));
}
