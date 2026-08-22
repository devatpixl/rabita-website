// Which prayer window we are currently inside, which one is next, and how
// far through the current one we are.
//
// Lifted out of components/prayer-today.tsx so the prayer page and the
// homepage band share one implementation. The difference from the original:
// this takes the day's real times as an argument instead of reading the
// static PRAYER_TIMES_TODAY fallback, so it works off lib/prayer-times.ts.
import type { PrayerDay } from './prayer-times';

export const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type PrayerKey = (typeof PRAYER_ORDER)[number];

export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export type PrayerWindow = {
  current: PrayerKey;
  next: PrayerKey;
  /** Minutes until the next prayer. */
  untilNext: number;
  /** 0–1 through the current window. */
  through: number;
};

export function prayerWindow(day: PrayerDay, nowMin: number): PrayerWindow {
  const stops = PRAYER_ORDER.map((k) => ({ key: k, at: minutesOf(day[k]) }));

  // Before Fajr we are still inside last night's Isha, so the default is the
  // last stop rather than the first — otherwise 02:00 reads as "Fajr now".
  let current = stops[stops.length - 1];
  let next = stops[0];
  let wrapped = true;

  for (let i = 0; i < stops.length; i += 1) {
    if (nowMin >= stops[i].at) {
      current = stops[i];
      next = stops[i + 1] ?? stops[0];
      wrapped = i === stops.length - 1;
    }
  }

  const from = current.at;
  const to = wrapped || next.at <= from ? next.at + 1440 : next.at;
  const n = nowMin < from ? nowMin + 1440 : nowMin;
  const span = Math.max(1, to - from);

  return {
    current: current.key,
    next: next.key,
    untilNext: Math.max(0, to - n),
    through: Math.min(1, Math.max(0, (n - from) / span)),
  };
}
