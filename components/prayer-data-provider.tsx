'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { PrayerData } from '@/lib/irn';
import { isoDate, type PrayerDay } from '@/lib/prayer-times';

// Carries the server-fetched prayer data (see lib/irn.ts) to the client
// components that render it: the utility-strip widget, the shared panel,
// the nav's compact trigger, the homepage band and the /bonnetider lead.
//
// The data is plain JSON — the IRN token never crosses this boundary.

const PrayerDataContext = createContext<PrayerData | null>(null);

export function PrayerDataProvider({ data, children }: { data: PrayerData; children: ReactNode }) {
  return <PrayerDataContext.Provider value={data}>{children}</PrayerDataContext.Provider>;
}

export function usePrayerData(): PrayerData {
  const ctx = useContext(PrayerDataContext);
  if (!ctx) throw new Error('usePrayerData must be used inside PrayerDataProvider');
  return ctx;
}

/** Today's row for a mounted `now`, looked up in the provided data. */
export function usePrayerDay(now: Date | null): PrayerDay | null {
  const { days } = usePrayerData();
  return useMemo(() => {
    if (!now) return null;
    const key = isoDate(now);
    return days.find((d) => d.date === key) ?? null;
  }, [days, now]);
}

/** Tomorrow's row, for the "next is Fajr" wrap after Isha. */
export function usePrayerDayAfter(now: Date | null): PrayerDay | null {
  const { days } = usePrayerData();
  return useMemo(() => {
    if (!now) return null;
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    const key = isoDate(d);
    return days.find((row) => row.date === key) ?? null;
  }, [days, now]);
}

/** Jumu'ah slots as one string: "14:00 · 15:00". */
export function joinJumuah(slots: string[]): string {
  // A slash, not a middot (client, 2026-09-12: "skille tydeligere mellom 14
  // og 15"). The utility strip divides its own segments with a middot too —
  // next prayer · jumu'ah · hijri date — so joining the two jumu'ah slots
  // with the same character made "14:00 · 15:00" read as two unrelated
  // fields rather than as two prayers on one day. The slash is a different
  // mark doing a different job.
  return slots.join(' / ');
}
