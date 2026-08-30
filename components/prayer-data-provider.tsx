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
  return slots.join(' · ');
}
