import type { Dayjs } from "dayjs";

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

export function getAvailableTimeSlots(selectedDate: Dayjs, now = new Date()): CallTimeSlot[] {
  const isToday = selectedDate.isSame(now, "day");

  if (!isToday) {
    return [...CALL_TIME_SLOTS];
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return CALL_TIME_SLOTS.filter((slot) => {
    const [h, m] = slot.split(":").map(Number);
    return h * 60 + m > currentMinutes;
  });
}
