'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { prayerWindow } from '@/lib/prayer-window';
import { usePrayerData, usePrayerDay } from './prayer-data-provider';
import { isoDate } from '@/lib/prayer-times';
import { hijriDate } from '@/lib/hijri';
import type { AppLocale } from '@/i18n/routing';

/**
 * Everything /bonnetider needs to know about the current moment, in one place.
 *
 * WHY IT EXISTS (2026-09-29). The phone redesign gives the page a photographic
 * masthead that leads on the NEXT prayer — its name, its time, the countdown
 * and the progress through the current window — while the board below it keeps
 * the six times and lights the same row. Two components, one answer required:
 * if the masthead said Asr and the list lit Maghrib, the page would be lying to
 * whichever half you happened to read.
 *
 * So this is a straight lift of what PrayerBoard already computed (its lines
 * 52-111 before the move), now called by both. Nothing about the derivation
 * changed; the board renders exactly what it rendered before.
 *
 * THE SSR CONTRACT, which every consumer has to honour. `now` is null until
 * mount — a clock cannot be in server HTML without shipping the server's
 * timezone as fact — so `win`, `until` and `progress` are empty on first paint
 * and the six times are not. Anything keyed on `now` must reserve its height,
 * or the hydration tick shifts the layout under the reader's thumb.
 */
export function usePrayerWindow() {
  const tv = useTranslations('prayerVisit');
  const locale = useLocale();

  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  // The six times are the whole point of this page, so they must be in the
  // HTML — not gated behind a clock that only exists after hydration. The row
  // is looked up from the server date first; once mounted, `now` takes over so
  // the board is correct if the page is left open across midnight.
  const { days } = usePrayerData();
  const mountedDay = usePrayerDay(now);
  const today = mountedDay ?? days.find((d) => d.date === isoDate(new Date())) ?? days[0] ?? null;

  const win = useMemo(
    () => (now && today ? prayerWindow(today, now.getHours() * 60 + now.getMinutes()) : null),
    [now, today],
  );

  const until = win
    ? win.untilNext >= 60
      ? tv('untilHm', { h: Math.floor(win.untilNext / 60), m: win.untilNext % 60 })
      : tv('untilM', { m: win.untilNext })
    : '';

  // The same figure without its preposition — "8t 1m", not "om 8t 1m".
  //
  // The phone masthead sets this as its hero figure at 3.5rem, and at that
  // size the little Norwegian "om" is a word-shaped hole holding the two
  // numbers apart. It belongs in a sentence, which is what `until` is for and
  // where the board and the lit row still use it. The bare keys are the same
  // strings with the preposition dropped, so nothing here is new prose.
  const untilBare = win
    ? win.untilNext >= 60
      ? tv('untilHmBare', { h: Math.floor(win.untilNext / 60), m: win.untilNext % 60 })
      : tv('untilMBare', { m: win.untilNext })
    : '';

  // Minutes since midnight, or null before mount. The day band in the masthead
  // needs the reader's position on a scale the six times define, and deriving
  // it there from `now` would mean a second component holding an opinion about
  // what time it is.
  const nowMinutes = now ? now.getHours() * 60 + now.getMinutes() : null;

  // Formatted from the day we are actually showing, not from the clock: keyed
  // on `now` this was client-only (blank in the HTML) and could name a
  // different date than the times printed under it. Parsed field-by-field
  // because `new Date('2026-08-31')` is parsed as UTC and lands on the 30th
  // for anyone west of Greenwich.
  //
  // Two lengths. The long one is 179px of mono capitals, which with the section
  // label beside it is 368px of text in the 342px a 390px phone actually has —
  // it wrapped. The year and the full weekday are the parts a phone can spare.
  const [gregorian, gregorianShort] = useMemo(() => {
    if (!today) return ['', ''];
    const [y, m, d] = today.date.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const tag = locale === 'ar' ? 'ar-EG' : locale === 'en' ? 'en-GB' : 'nb-NO';
    const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(tag, o).format(date);
    return [
      fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      fmt({ weekday: 'short', day: 'numeric', month: 'short' }),
    ];
  }, [today, locale]);

  // The hijri date of the SAME day the times are for — derived from
  // today.date like the gregorian above, not from the client clock, so the
  // two lines flanking this row can never name different days.
  const hijri = useMemo(() => {
    if (!today) return '';
    const [y, m, d] = today.date.split('-').map(Number);
    return hijriDate(locale as AppLocale, new Date(y, m - 1, d, 12));
  }, [today, locale]);

  // How far through the current window we are, for the rail along the foot.
  // `through` is already 0-1 from lib/prayer-window.
  const progress = win ? Math.min(100, Math.max(0, win.through * 100)) : 0;

  return {
    now,
    nowMinutes,
    today,
    win,
    until,
    untilBare,
    gregorian,
    gregorianShort,
    hijri,
    progress,
  };
}
