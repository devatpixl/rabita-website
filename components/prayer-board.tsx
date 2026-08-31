'use client';

import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { PRAYER_ORDER, prayerWindow, type PrayerKey } from '@/lib/prayer-window';
import { joinJumuah, usePrayerData, usePrayerDay } from './prayer-data-provider';
import { isoDate } from '@/lib/prayer-times';
import { cn } from '@/lib/cn';

// The prayer board — the lead block of /bonnetider, rebuilt 2026-08-31 to the
// design the client supplied.
//
// One card carrying the whole answer: what is next, how long you have, and the
// six times underneath with the next one lit. A progress rail along the foot
// shows how far through the current window you are.
//
// Everything here is derived from data we actually hold — the day's six times
// and the Jumu'ah slots. Nothing about the mosque's schedule is invented.

const ORDER = PRAYER_ORDER;

// How long each Jumu'ah khutba runs. Stated by the client on 2026-08-31 —
// Norwegian 14:00 to 14:30, Arabic 15:00 to 15:30 — and kept as a length
// rather than as four hardcoded times so it stays tied to the Jumu'ah slots.
const KHUTBA_MINUTES = 30;

export function PrayerBoard({ eyebrow }: { eyebrow?: string }) {
  const t = useTranslations('prayerBoard');
  const tv = useTranslations('prayerVisit');
  const locale = useLocale();
  const { jumuah } = usePrayerData();
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

  // How far through the current window we are, for the rail along the foot.
  // `through` is already 0-1 from lib/prayer-window.
  const progress = win ? Math.min(100, Math.max(0, win.through * 100)) : 0;

  // The day's order, beside Jumu'ah.
  //
  // Every value here is one we already hold and publish elsewhere on the site
  // — the opening hour from nav.openHours, Dhuhr from today's table, the first
  // Jumu'ah slot from the Jumu'ah data. Nothing about the mosque's schedule is
  // invented, so a "doors open" or "adhan" row the mosque has never announced
  // cannot appear here. The reference design showed such times; they are not
  // in our data, and sending someone to a locked door is worse than a shorter
  // list.
  // Friday, hour by hour. The building's own 06:00 opening and the day's
  // Dhuhr adhan came out on 2026-08-31 (client): this panel sits beside
  // Jumu'ah, and a row about Tuesday morning or a prayer that Jumu'ah
  // replaces was answering a question nobody had asked here.
  //
  // What is left is the Friday itself — when you can come in, and the two
  // khutbas. Every time still comes from the Jumu'ah data; only the khutba
  // length and the two languages are stated, so a change to the slots
  // upstream carries through on its own.
  const glance = useMemo(() => {
    const rows: { key: string; time: string; title: string; note?: string; icon: ReactNode }[] = [];
    if (jumuah[0]) {
      rows.push({
        key: 'doors',
        time: jumuah[0],
        title: t('doorsOpen'),
        icon: <DoorIcon className="h-4 w-4" />,
      });
    }
    const plusHalfHour = (hhmm: string) => {
      const [h, m] = hhmm.split(':').map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      const t = (h * 60 + m + KHUTBA_MINUTES) % 1440;
      return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    };
    ([
      [jumuah[0], t('khutbaNo')],
      [jumuah[1], t('khutbaAr')],
    ] as const).forEach(([start, title], i) => {
      if (!start) return;
      const end = plusHalfHour(start);
      rows.push({
        key: `khutba-${i}`,
        time: end ? `${start}\u2013${end}` : start,
        title,
        icon: <MicIcon className="h-4 w-4" />,
      });
    });
    return rows;
  }, [jumuah, t]);

  return (
    <div className="space-y-5">
      {/* Section label and date on one baseline, ends of the same row. Both are
         the same small mono voice, so stacking them was two half-empty lines
         where one reads better and gives the board 50px more of the screen. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        {/* Phones only: from md up the band above the board carries this
           label, and repeating it here would print it twice. */}
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-ink-60 md:hidden">
          {eyebrow}
        </p>
        {/* Only one of these is ever displayed, and display:none is not
           announced, so this is one date to a reader — not two. */}
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60 md:ms-auto">
          <span className="sm:hidden">{gregorianShort}</span>
          <span className="hidden sm:inline">{gregorian}</span>
        </p>
      </div>

      {/* ── the board ─────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-[1.5rem] border border-rule bg-paper">
        <div className="grid items-center gap-5 p-6 md:grid-cols-[1fr_auto_13rem] md:gap-10 md:p-7">
          <div>
            <p className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-gold-deep">
              <ClockIcon className="h-3.5 w-3.5" />
              {t('nextLabel')}
            </p>
            <p className="mt-3 font-serif text-[clamp(2rem,4.4vw,3.25rem)] leading-none text-ink">
              {win ? tv(`names.${win.next}`) : ' '}
            </p>
            {/* The countdown in the accent, italic — the one line that changes
               while you are looking at it. */}
            <p className="mt-2 font-serif text-[1.05rem] italic text-gold-deep">{until}</p>
          </div>

          <p className="font-serif text-[clamp(2.5rem,6.5vw,4.25rem)] leading-none tabular-nums text-ink md:justify-self-end">
            {win && today ? today[win.next] : ' '}
          </p>

          {/* The hour of the day, drawn. Decorative and aria-hidden: it says
             nothing the times beside it do not already say. */}
          <PrayerScene
            prayer={win?.next ?? 'maghrib'}
            className="hidden h-[6.25rem] w-full overflow-hidden rounded-2xl md:block"
          />
        </div>

        {/* ── the six ─────────────────────────────────────────────────── */}
        <ul className="grid grid-cols-3 gap-2 px-4 pb-4 sm:grid-cols-6 sm:gap-3 sm:px-6 sm:pb-6">
          {ORDER.map((key) => {
            const isNext = win?.next === key;
            return (
              <li key={key}>
                <div
                  className={cn(
                    'flex h-full flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-colors sm:py-4',
                    isNext
                      ? 'border-gold-deep/45 bg-gold/10'
                      : 'border-rule bg-paper-2/50',
                  )}
                >
                  <span className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-60">
                    {tv(`names.${key}`)}
                  </span>
                  <span
                    className={cn(
                      'font-serif text-[1.15rem] leading-none tabular-nums sm:text-[1.3rem]',
                      isNext ? 'text-gold-deep' : 'text-ink',
                    )}
                  >
                    {today ? today[key] : '—'}
                  </span>
                  <PrayerGlyph
                    prayer={key}
                    className={cn('mt-0.5 h-4 w-4', isNext ? 'text-gold-deep' : 'text-ink-60/60')}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        {/* ── progress rail ───────────────────────────────────────────── */}
        <div className="flex items-center gap-4 border-t border-rule px-6 py-3.5">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-paper-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-gold-deep transition-[width] duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="shrink-0 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-60">
            {win ? t('progressLabel', { name: tv(`names.${win.next}`), m: win.untilNext }) : ''}
          </p>
        </div>
      </section>

      {/* ── Jumu'ah, and the shape of the day beside it ─────────────── */}
      {/* Jumu'ah used to run the full width with everything stacked at its
         left end, so two thirds of the card was empty paper. It is a pair now:
         the times on the left, the day's order on the right. Equal-height
         cards, because the grid stretches them. */}
      <div className="grid gap-5 md:grid-cols-[1.35fr_1fr]">
        <section className="relative overflow-hidden rounded-[1.5rem] border border-rule bg-paper-2/60 p-6 md:p-8 md:pb-24">
          <p className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-gold-deep">
            <MinaretIcon className="h-4 w-4" />
            {t('jumuahHeading')}
          </p>
          <p className="mt-3 font-serif text-[clamp(1.8rem,3.6vw,2.5rem)] leading-none tabular-nums text-ink">
            {joinJumuah(jumuah)}
          </p>
          <p className="mt-3 text-body text-ink-60">{t('jumuahNote')}</p>
          <p className="mt-5 inline-flex items-center gap-3 rounded-full border border-rule bg-paper px-4 py-2.5 text-[14px] text-ink">
            <MicIcon className="h-4 w-4 shrink-0 text-gold-deep" />
            {t('jumuahImams')}
          </p>
          {/* A skyline along the foot, at 10% ink. The card is taller than its
             own words once it sits beside the timeline, and this fills the
             remainder without adding anything to read. */}
          <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-16 w-full text-gold-deep/15 md:block" />
        </section>

        {/* ── the day's order ───────────────────────────────────────── */}
        <section className="rounded-[1.5rem] border border-rule bg-paper p-6 md:p-7">
          <h3 className="font-serif text-[1.2rem] leading-none text-ink">{t('glanceHeading')}</h3>
          <ol className="mt-6">
            {glance.map((row, i) => (
              <li key={row.key} className="relative flex gap-3.5 pb-6 last:pb-0">
                {/* The rail joining one stop to the next. Drawn from the chip's
                   centre (a 2.25rem chip, so 1.125rem in) and stopped before
                   the last row, which has nothing to join to. */}
                {i < glance.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute bottom-0 start-[1.125rem] top-9 w-px bg-rule"
                  />
                )}
                <span className="relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rule bg-paper-2 text-gold-deep">
                  {row.icon}
                </span>
                <div className="min-w-0 pt-1">
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span className="font-serif text-[1.05rem] leading-none tabular-nums text-ink">
                      {row.time}
                    </span>
                    <span className="text-[14px] leading-none text-ink">{row.title}</span>
                  </p>
                  {row.note && (
                    <p className="mt-1.5 text-[13px] leading-snug text-ink-60">{row.note}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

/* ── marks ─────────────────────────────────────────────────────────────── */

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function MinaretIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 2v3" />
      <path d="M8 21V11a4 4 0 0 1 8 0v10" />
      <path d="M5 21h14" />
    </svg>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
    </svg>
  );
}

function DoorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
      <path d="M3 21h16M12 12h.01" />
    </svg>
  );
}

/* The skyline along the foot of the Jumu'ah card.
   A filled silhouette, not an outline. The first attempt stroked the domes and
   sliced the viewBox to cover, which cropped the spires off and left a row of
   arches that read as gravestones. Filled, with the box proportioned to the
   band it sits in so `none` can stretch it edge to edge without visibly
   distorting anything. */
function Skyline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 660 60"
      className={className}
      aria-hidden
      preserveAspectRatio="none"
      fill="currentColor"
    >
      <path d="M0 60 L0 44 L30 44 L30 12 A6 6 0 0 1 42 12 L42 44 L60 44
               A35 26 0 0 1 130 44 L150 44 L150 8 A6 6 0 0 1 162 8 L162 44 L182 44
               A44 32 0 0 1 270 44 L292 44 L292 14 A6 6 0 0 1 304 14 L304 44 L322 44
               A32 24 0 0 1 386 44 L408 44 L408 10 A6 6 0 0 1 420 10 L420 44 L440 44
               A38 28 0 0 1 516 44 L538 44 L538 16 A6 6 0 0 1 550 16 L550 44 L570 44
               A30 22 0 0 1 630 44 L660 44 L660 60 Z" />
    </svg>
  );
}


/* ── the scene on the board ──────────────────────────────────────────────
   The plate beside the next prayer used to be a stroked mosque outline on a
   flat gradient. It is a drawn scene now: sky, a sun or a crescent, a warm
   horizon glow and a silhouette — and it changes with the prayer, so the card
   looks like the hour it is describing.

   Six settings, all inside the site's warm cream-and-gold family. The night
   prayers cool the sky rather than darken it: this is a 208x100 plate on a
   paper card, and a genuinely dark rectangle there reads as a hole in the page
   rather than as night.

   The silhouette is ONE flat tone. A first pass gave each element its own
   opacity, which turned a building into a stack of differently-grey boxes —
   a silhouette is defined by having no internal edges.

   Nothing here is a photograph or a claim: it is ornament, so it carries
   aria-hidden and no text. */
type Scene = {
  sky: [string, string, string];
  sun: { x: number; y: number; r: number; opacity: number } | null;
  moon: boolean;
  // Solid, not a tone plus an opacity: a translucent silhouette lets the sun
  // behind it shine through the masonry, which is what a silhouette exists to
  // prevent. These are the blended values, chosen directly.
  ink: string;
};

const SCENES: Record<PrayerKey, Scene> = {
  // Before dawn: the sky has cooled and the horizon has not warmed yet.
  fajr: {
    sky: ['#DAD9D6', '#EAE4D8', '#F7F1E4'],
    sun: null,
    moon: true,
    ink: '#7B7466',
  },
  // First light, low and directly behind the building.
  sunrise: {
    sky: ['#F3EAD9', '#F6E1C0', '#FCF5E8'],
    sun: { x: 86, y: 66, r: 19, opacity: 0.42 },
    moon: false,
    ink: '#7E6739',
  },
  // Midday: the brightest sky, the sun small and high.
  dhuhr: {
    sky: ['#F6F1E2', '#F4EBD6', '#FBF7EE'],
    sun: { x: 52, y: 28, r: 12, opacity: 0.5 },
    moon: false,
    ink: '#A38E5E',
  },
  // Afternoon: warmer, the sun past its height.
  asr: {
    sky: ['#F5ECD9', '#F2DEBB', '#FBF4E6'],
    sun: { x: 56, y: 44, r: 15, opacity: 0.45 },
    moon: false,
    ink: '#87703F',
  },
  // Sunset: the strongest gold, the sun on the horizon, the crescent already
  // up. This is the setting the client's reference shows.
  maghrib: {
    sky: ['#EEDCBD', '#E8CB98', '#F9F0DE'],
    sun: { x: 90, y: 72, r: 23, opacity: 0.45 },
    moon: true,
    ink: '#6B5330',
  },
  // Night.
  isha: {
    sky: ['#D4D5D4', '#E4DFD3', '#F5EFE3'],
    sun: null,
    moon: true,
    ink: '#6C6656',
  },
};

function PrayerScene({ prayer, className }: { prayer: PrayerKey; className?: string }) {
  // Gradient ids must be unique per instance, or a second scene on the page
  // would silently paint with the first one's sky.
  const uid = useId().replace(/:/g, '');
  const s = SCENES[prayer];
  return (
    <svg
      viewBox="0 0 208 100"
      className={className}
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s.sky[0]} />
          <stop offset="58%" stopColor={s.sky[1]} />
          <stop offset="100%" stopColor={s.sky[2]} />
        </linearGradient>
        <radialGradient id={`glow-${uid}`}>
          <stop offset="0%" stopColor="#E9DBBC" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#E9DBBC" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#E9DBBC" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="208" height="100" fill={`url(#sky-${uid})`} />

      {/* Sun first, so the building stands in front of it. The halo runs to
         three and a half times the disc, which is what makes the light read as
         coming from behind rather than as a sticker on the sky. */}
      {s.sun && (
        <>
          <circle cx={s.sun.x} cy={s.sun.y} r={s.sun.r * 3.5} fill={`url(#glow-${uid})`} />
          <circle cx={s.sun.x} cy={s.sun.y} r={s.sun.r} fill="#C0A165" opacity={s.sun.opacity} />
        </>
      )}

      {/* Crescent: the outer disc with a smaller one, offset up and right,
         taken out of it by the even-odd rule. Drawn in the open sky on the
         left — the plate is twice as wide as it is tall, and putting the moon
         beside the domes on the right just crowds that corner. */}
      {s.moon && (
        <path
          fillRule="evenodd"
          fill={s.ink}
          opacity="0.75"
          d="M44 13a13 13 0 1 0 0 26 13 13 0 1 0 0-26Z
             M49 10a11.5 11.5 0 1 0 0 23 11.5 11.5 0 1 0 0-23Z"
        />
      )}

      {/* The mosque. One flat tone and no internal edges — a silhouette is
         defined by having none. It runs to the bottom of the plate rather than
         standing on a drawn ground line: that line read as an underline with a
         gap above it, and buildings meeting the frame edge look like a skyline
         rather than a sticker. */}
      <g fill={s.ink}>
        {/* low arched wall, left */}
        <path d="M68 100V86c0-5 4-9 9-9h10c5 0 9 4 9 9v14Z" />
        {/* minaret: shaft, cap, finial */}
        <path d="M100 100V40h9v60Z" />
        <path d="M98 40c0-7 2.5-11 6.5-15 4 4 6.5 8 6.5 15Z" />
        <path d="M103.2 25h2.6v-7h-2.6Z" />
        <circle cx="104.5" cy="16.5" r="2.6" />
        {/* the great onion dome on its drum */}
        <path d="M116 100V78h38v22Z" />
        <path d="M117 78c-7-10-5-19 4-27 5-5 10-8 14-15 4 7 9 10 14 15 9 8 11 17 4 27Z" />
        <path d="M133.6 36h2.8v-9h-2.8Z" />
        <circle cx="135" cy="25" r="2.9" />
        {/* half dome, right */}
        <path d="M160 100V86h26v14Z" />
        <path d="M160 86c-3-9 4-15 13-20 9 5 16 11 13 20Z" />
      </g>
    </svg>
  );
}

/* The six marks: a moon before dawn, the sun rising, high, setting, and the
   night moon again — so the row reads as a day even before you read a time. */
function PrayerGlyph({ prayer, className }: { prayer: PrayerKey; className?: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };
  if (prayer === 'fajr' || prayer === 'isha') {
    return (
      <svg {...common}>
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
      </svg>
    );
  }
  if (prayer === 'dhuhr') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
      </svg>
    );
  }
  // sunrise / asr / maghrib — sun on the horizon
  return (
    <svg {...common}>
      <circle cx="12" cy="13" r="3.5" />
      <path d="M4 19h16M12 5v2M5.6 8.6l1.4 1.4M17 10l1.4-1.4" />
    </svg>
  );
}
