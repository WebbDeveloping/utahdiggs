import { ListingStatus } from "@/generated/prisma/client";
import {
  getCallDateString,
  getCallSlotTime,
  getMountainDayBounds,
  parseCallDateTime,
} from "@/lib/consumer/call-datetime";
import { CALL_TIME_SLOTS, type CallTimeSlot } from "@/lib/consumer/call-time-slots";
import { prisma } from "@/lib/db";

export async function getBookedCallSlotsForDate(
  date: string,
  excludeListingId?: string,
): Promise<CallTimeSlot[]> {
  const { start, end } = getMountainDayBounds(date);

  const listings = await prisma.listing.findMany({
    where: {
      scheduledCallAt: { gte: start, lte: end },
      status: { not: ListingStatus.CANCELLED },
      ...(excludeListingId ? { id: { not: excludeListingId } } : {}),
    },
    select: { scheduledCallAt: true },
  });

  const booked = new Set<CallTimeSlot>();
  for (const listing of listings) {
    if (!listing.scheduledCallAt) continue;
    const slot = getCallSlotTime(listing.scheduledCallAt);
    if (slot) {
      booked.add(slot);
    }
  }

  return CALL_TIME_SLOTS.filter((slot) => booked.has(slot));
}

export async function isCallSlotAvailable(
  date: string,
  time: string,
  excludeListingId?: string,
): Promise<boolean> {
  const scheduledCallAt = parseCallDateTime(date, time);
  if (!scheduledCallAt) {
    return false;
  }

  const conflict = await prisma.listing.findFirst({
    where: {
      scheduledCallAt,
      status: { not: ListingStatus.CANCELLED },
      ...(excludeListingId ? { id: { not: excludeListingId } } : {}),
    },
    select: { id: true },
  });

  return conflict == null;
}

export async function getBookedCallDatesInRange(
  from: Date,
  to: Date,
  excludeListingId?: string,
): Promise<Set<string>> {
  const listings = await prisma.listing.findMany({
    where: {
      scheduledCallAt: { gte: from, lte: to },
      status: { not: ListingStatus.CANCELLED },
      ...(excludeListingId ? { id: { not: excludeListingId } } : {}),
    },
    select: { scheduledCallAt: true },
  });

  const dates = new Set<string>();
  for (const listing of listings) {
    if (!listing.scheduledCallAt) continue;
    dates.add(getCallDateString(listing.scheduledCallAt));
  }

  return dates;
}
