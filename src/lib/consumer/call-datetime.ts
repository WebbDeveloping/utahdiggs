import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { CALL_TIME_SLOTS, type CallTimeSlot } from "@/lib/consumer/call-time-slots";

dayjs.extend(utc);
dayjs.extend(timezone);

export const CALL_TIMEZONE = "America/Denver";

export function parseCallDateTime(callDate: string, callTime: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(callDate)) {
    return null;
  }
  if (!CALL_TIME_SLOTS.includes(callTime as CallTimeSlot)) {
    return null;
  }

  const parsed = dayjs.tz(`${callDate} ${callTime}`, "YYYY-MM-DD HH:mm", CALL_TIMEZONE);
  if (!parsed.isValid()) {
    return null;
  }

  return parsed.toDate();
}

export function formatCallDateTime(date: Date): string {
  return dayjs(date).tz(CALL_TIMEZONE).format("ddd, MMM D [at] h:mm A z");
}

export function formatCallDateForEmail(date: Date): string {
  return dayjs(date).tz(CALL_TIMEZONE).format("dddd, MMMM D, YYYY [at] h:mm A z");
}

export function formatCallTimeOnly(date: Date): string {
  return dayjs(date).tz(CALL_TIMEZONE).format("h:mm A z");
}

export function formatCallDateOnly(date: Date): string {
  return dayjs(date).tz(CALL_TIMEZONE).format("dddd, MMMM D, YYYY");
}

export function getCallSlotTime(date: Date): CallTimeSlot | null {
  const slot = dayjs(date).tz(CALL_TIMEZONE).format("HH:mm");
  return CALL_TIME_SLOTS.includes(slot as CallTimeSlot) ? (slot as CallTimeSlot) : null;
}

export function getCallDateString(date: Date): string {
  return dayjs(date).tz(CALL_TIMEZONE).format("YYYY-MM-DD");
}

export function getMountainDayBounds(date: string): { start: Date; end: Date } {
  const start = dayjs.tz(date, "YYYY-MM-DD", CALL_TIMEZONE).startOf("day");
  const end = start.endOf("day");
  return { start: start.toDate(), end: end.toDate() };
}

export function nowInCallTimezone(): dayjs.Dayjs {
  return dayjs().tz(CALL_TIMEZONE);
}
