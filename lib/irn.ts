// Live prayer times from IRN's "Felles bønnetid" API (api.bonnetid.no).
//
// Server-only. The token is read from IRN_API_TOKEN and must never reach
// the client — the data does, the credential does not.
//
// What we take from IRN:
//   • /prayertimes/{location}/{y}/{m}/  → the six daily times for Oslo, plus
//     the 2× shadow Asr. Asr on the site is the 1× time (same as the old
//     rabita.no table). The 2× time is kept on the row as asr2x but not
//     shown anywhere — decision 2026-08-30.
//   • /mosques/{org_nr}/               → Rabita's jama'ah times and jumu'ah
//     slots, which the mosque maintains itself in IRN's admin.
//
// Everything is cached for six hours via the fetch cache and the page's
// ISR window. If IRN is unreachable we fall back to the static table in
// lib/prayer-times.ts so the site never shows an empty band.
import { cache } from 'react';
import { PRAYER_DAYS, isoDate, type PrayerDay } from './prayer-times';

export const IRN_REVALIDATE_SECONDS = 6 * 60 * 60;

export type PrayerData = {
  days: PrayerDay[];
  /** Congregational (jama'ah) times as published by the mosque; null when not set. */
  jamaah: { fajr: string | null; dhuhr: string | null; asr: string | null; maghrib: string | null; isha: string | null };
  /** Jumu'ah slots, e.g. ['14:00', '15:00']. */
  jumuah: string[];
  /** Rabita's registered Asr convention on IRN. */
  asrMethod: string | null;
  source: 'irn' | 'fallback';
  fetchedAt: string;
};

type IrnDay = {
  date: string; // DD-MM-YYYY
  fajr: string;
  shuruq_sunrise: string;
  duhr: string;
  asr: string;
  shadow_2x: string | null;
  maghrib: string;
  isha: string;
};

type IrnMosque = {
  asr_method: string | null;
  jamat: { fajr: string | null; duhr: string | null; asr: string | null; maghrib: string | null; isha: string | null } | null;
  jummah: { jummah: string }[];
};

const FALLBACK_JUMUAH = ['14:00', '15:00'];

function config() {
  const token = process.env.IRN_API_TOKEN;
  if (!token) return null;
  return {
    base: (process.env.IRN_API_BASE ?? 'https://api.bonnetid.no').replace(/\/$/, ''),
    token,
    locationId: process.env.IRN_LOCATION_ID ?? '181', // Oslo
    orgNr: process.env.IRN_MOSQUE_ORG_NR ?? '983228364', // Rabita – Det Islamske Forbundet
  };
}

async function irnGet<T>(cfg: NonNullable<ReturnType<typeof config>>, path: string): Promise<T> {
  const res = await fetch(`${cfg.base}${path}`, {
    headers: { 'Api-Token': cfg.token },
    next: { revalidate: IRN_REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`IRN ${path} → ${res.status}`);
  return (await res.json()) as T;
}

/** "30-08-2026" → "2026-08-30". IRN's dates are day-first. */
function toIso(dmy: string): string {
  const [d, m, y] = dmy.split('-');
  return `${y}-${m}-${d}`;
}

/** Strip seconds if IRN ever sends "HH:MM:SS". */
function hhmm(t: string | null | undefined): string {
  return (t ?? '').slice(0, 5);
}

function mapDay(row: IrnDay): PrayerDay {
  return {
    date: toIso(row.date),
    fajr: hhmm(row.fajr),
    sunrise: hhmm(row.shuruq_sunrise),
    dhuhr: hhmm(row.duhr),
    asr: hhmm(row.asr),
    asr2x: row.shadow_2x ? hhmm(row.shadow_2x) : undefined,
    maghrib: hhmm(row.maghrib),
    isha: hhmm(row.isha),
  };
}

/** The months to keep live: this one and the two after it. */
function monthsFrom(now: Date, count: number): { y: number; m: number }[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return { y: d.getFullYear(), m: d.getMonth() + 1 };
  });
}

function fallback(): PrayerData {
  return {
    days: [...PRAYER_DAYS],
    jamaah: { fajr: null, dhuhr: null, asr: null, maghrib: null, isha: null },
    jumuah: FALLBACK_JUMUAH,
    asrMethod: null,
    source: 'fallback',
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Prayer data for the site. One call per request (React cache), one
 * upstream fetch per six hours (fetch cache). Never throws.
 */
export const getPrayerData = cache(async (): Promise<PrayerData> => {
  const cfg = config();
  if (!cfg) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[irn] IRN_API_TOKEN not set — using static prayer table');
    }
    return fallback();
  }

  const now = new Date();
  try {
    const [months, mosque] = await Promise.all([
      Promise.all(
        monthsFrom(now, 3).map(({ y, m }) =>
          irnGet<IrnDay[]>(cfg, `/prayertimes/${cfg.locationId}/${y}/${m}/`).catch((err) => {
            // A month IRN has not generated yet is not a failure of the feed.
            console.warn(`[irn] month ${y}-${m} unavailable:`, (err as Error).message);
            return [] as IrnDay[];
          }),
        ),
      ),
      irnGet<IrnMosque>(cfg, `/mosques/${cfg.orgNr}/`).catch((err) => {
        console.warn('[irn] mosque record unavailable:', (err as Error).message);
        return null;
      }),
    ]);

    const live = new Map<string, PrayerDay>();
    for (const row of months.flat()) {
      const day = mapDay(row);
      if (day.fajr && day.isha) live.set(day.date, day);
    }
    if (live.size === 0) throw new Error('IRN returned no days');

    // Static rows fill any gap the live window does not cover, so the
    // calendar page can still show months IRN has not published.
    const merged = new Map<string, PrayerDay>(PRAYER_DAYS.map((d) => [d.date, d]));
    for (const [k, v] of live) merged.set(k, v);
    const days = [...merged.values()].sort((a, b) => a.date.localeCompare(b.date));

    const jumuah = (mosque?.jummah ?? [])
      .map((j) => hhmm(j.jummah))
      .filter(Boolean)
      .sort();

    return {
      days,
      jamaah: {
        fajr: mosque?.jamat?.fajr ? hhmm(mosque.jamat.fajr) : null,
        dhuhr: mosque?.jamat?.duhr ? hhmm(mosque.jamat.duhr) : null,
        asr: mosque?.jamat?.asr ? hhmm(mosque.jamat.asr) : null,
        maghrib: mosque?.jamat?.maghrib ? hhmm(mosque.jamat.maghrib) : null,
        isha: mosque?.jamat?.isha ? hhmm(mosque.jamat.isha) : null,
      },
      jumuah: jumuah.length ? jumuah : FALLBACK_JUMUAH,
      asrMethod: mosque?.asr_method ?? null,
      source: 'irn',
      fetchedAt: now.toISOString(),
    };
  } catch (err) {
    console.error('[irn] falling back to static prayer table:', (err as Error).message);
    return fallback();
  }
});

/** Convenience: today's row from a PrayerData, or null outside the data. */
export function todayFrom(data: PrayerData, d: Date): PrayerDay | null {
  const key = isoDate(d);
  return data.days.find((row) => row.date === key) ?? null;
}
