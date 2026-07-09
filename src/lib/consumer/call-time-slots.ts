import type { Dayjs } from "dayjs";
import { nowInCallTimezone } from "@/lib/consumer/call-datetime";

export const CALL_TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
] as const;

export type CallTimeSlot = (typeof CALL_TIME_SLOTS)[number];

export function formatTimeLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function formatSelectedSlot(date: Dayjs, time: string): string {
  const [h, m] = time.split(":").map(Number);
  const slot = date.hour(h).minute(m).second(0).millisecond(0);
  return slot.format("ddd, MMM D [at] h:mm A");
}

export function getAvailableTimeSlots(
  selectedDate: Dayjs,
  now = new Date(),
  bookedSlots: readonly CallTimeSlot[] = [],
): CallTimeSlot[] {
  const bookedSet = new Set(bookedSlots);
  const mountainNow = nowInCallTimezone();
  const isToday = selectedDate.format("YYYY-MM-DD") === mountainNow.format("YYYY-MM-DD");

  const afterPastFilter = !isToday
    ? [...CALL_TIME_SLOTS]
    : CALL_TIME_SLOTS.filter((slot) => {
        const [h, m] = slot.split(":").map(Number);
        const slotMinutes = h * 60 + m;
        const currentMinutes = mountainNow.hour() * 60 + mountainNow.minute();
        return slotMinutes > currentMinutes;
      });

  return afterPastFilter.filter((slot) => !bookedSet.has(slot));
}
