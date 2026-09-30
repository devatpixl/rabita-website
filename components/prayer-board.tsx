'use client';

import Image from 'next/image';

import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { PRAYER_ORDER, type PrayerKey } from '@/lib/prayer-window';
import { joinJumuah, usePrayerData } from './prayer-data-provider';
import { IMAMS } from '@/lib/imams';
import { usePrayerWindow } from './use-prayer-window';
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

export function PrayerBoard({ eyebrow }: { eyebrow?: string }) {
  const t = useTranslations('prayerBoard');
  const tv = useTranslations('prayerVisit');
  const { jumuah } = usePrayerData();
  // Two khateebs, not one (client, 2026-09-13: "Ukas khatib kan gjøres til to
  // personer uten tekst"), each labelled with the khutba he gives — the card
  // beside this one lists a Norwegian and an Arabic khutba at different hours,
  // and this says who delivers each.
  //
  // STILL A PLACEHOLDER (client, 2026-09-02: "put image of any imam for now").
  // There is no rota anywhere in the data, so WHO is paired with WHICH khutba
  // is inference, not fact: Usman teaches in Norwegian by his own bio, Osama
  // lists Arabic first. Confirm with the client, and wire a real schedule
  // before launch, or the card announces a khutba a man is not giving.
  const khateebs = (
    [
      ['andreas', 'khutbaNo'],
      ['aldiri', 'khutbaAr'],
    ] as const
  )
    .map(([key, khutba]) => ({ imam: IMAMS.find((i) => i.key === key), khutba }))
    .filter((k): k is { imam: (typeof IMAMS)[number]; khutba: 'khutbaNo' | 'khutbaAr' } =>
      Boolean(k.imam),
    );
  // All of it — the 30s tick, the day, the window, the countdown, both date
  // formats, the hijri line and the progress — moved to a shared hook on
  // 2026-09-29 so the phone masthead above this board cannot disagree with it
  // about which prayer is next. A pure move; see components/use-prayer-window.ts.
  const { today, win, until, gregorian, gregorianShort, hijri, progress } = usePrayerWindow();

  // The day's order, beside Jumu'ah.
  //
  // Every value here is one we already hold and publish elsewhere on the site
  // — the opening hour from nav.openHours, Dhuhr from today's table, the first
  // Jumu'ah slot from the Jumu'ah data. Nothing about the mosque's schedule is
  // invented, so a "doors open" or "adhan" row the mosque has never announced
  // cannot appear here. The reference design showed such times; they are not
  // in our data, and sending someone to a locked door is worse than a shorter
  // list.

  return (
    <div className="space-y-5">
      {/* Section label and date on one baseline, ends of the same row. Both are
         the same small mono voice, so stacking them was two half-empty lines
         where one reads better and gives the board 50px more of the screen. */}
      {/* max-md:hidden as of 2026-09-29: the phone masthead above the board now
         carries the page name AND both dates, so this row would be the second
         printing of each on the same screen. From md it is unchanged. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 max-md:hidden">
        {/* Phones only: from md up the band above the board carries this
           label, and repeating it here would print it twice. */}
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-ink-60 md:hidden">
          {eyebrow}
        </p>
        {/* The hijri date holds the start of the row (client, 2026-09-04),
           the gregorian the end — the day in both calendars, one baseline.
           md+ only: on phones the eyebrow label owns this slot. */}
        {hijri && (
          <p className="hidden font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold-deep md:block">
            {hijri}
          </p>
        )}
        {/* Only one of these is ever displayed, and display:none is not
           announced, so this is one date to a reader — not two. */}
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60 md:ms-auto">
          <span className="sm:hidden">{gregorianShort}</span>
          <span className="hidden sm:inline">{gregorian}</span>
        </p>
      </div>

      {/* ── the board ─────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-[1.5rem] border border-rule bg-paper">
        {/* max-md:hidden as of 2026-09-29: name, countdown and time are the
           masthead's subject on phones. Leaving this here as well printed the
           same three facts twice, 60px apart, which is what made the phone page
           read as a stack of boxes rather than an answer. */}
        <div className="grid items-center gap-5 p-6 max-md:hidden md:grid-cols-[1fr_auto_13rem] md:gap-10 md:p-7">
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

        {/* ── THE SIX, AND ONE MOMENT AMONG THEM (phones, 2026-09-29) ─────
           The first pass made these a list instead of six boxes, which was
           right and not enough. Six rows of equal weight with a 2px dot at the
           end is a settings screen: the name was 1.05rem against a 1.3rem
           time, so the number the reader came for was barely louder than its
           label, and the lit row's 10% gold tint did not separate from paper.

           Two changes, and the second is the one the client asked for.

           TYPE. The time is now the loud part at 1.55rem serif and the name is
           small mono capitals. A day's prayer times are a timetable, and on a
           timetable you read the figures and use the names to confirm.

           ONE MOMENT. The next prayer is no longer a tint on a row; it is a
           card in dusk with the countdown inside it, so the list has a single
           place the eye lands. Everything else stays quiet. This also puts the
           countdown where a reader who has scrolled past the masthead can
           still see it, which is most of the time on a 3 500px page.

           THE DOT COLUMN IS GONE. Three dot states carried what the colour and
           the card already say, and it cost every row 12px of its measure. The
           states survive where they were actually needed: as sr-only words,
           because weight and fill are exactly what a screen reader cannot see.

           THE STATE COMES FROM `win`, NOT FROM THE CLOCK. `win.next` is the
           one row to lift; everything at or before `win.current` has been and
           gone. The one case worth naming is the wrap: after Isha, win.current
           is 'isha' and win.next is 'fajr', so every row is passed and Fajr —
           index 0, which is NOT after current — is next. Testing `key ===
           win.next` first is what makes that fall out right instead of needing
           a special case.

           Before mount `win` is null, every row renders quiet and no card is
           drawn. That is correct rather than merely safe: the times are the
           server's, the state is the reader's. It does mean the card appears
           on the hydration tick, which is why the list reserves nothing for it
           — a card that pushes the rows below it down by 76px once, before
           first interaction, is cheaper than 76px of hole on every load. */}
        <ul className="px-5 pb-4 pt-2 md:hidden">
          {ORDER.map((key, i) => {
            const isNext = win?.next === key;
            const passed =
              win != null && !isNext && ORDER.indexOf(key) <= ORDER.indexOf(win.current);

            if (isNext) {
              return (
                <li
                  key={key}
                  className="-mx-2 my-2 rounded-2xl bg-dusk px-4 py-3.5 text-paper"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold">
                      {t('stateNext')} · {tv(`names.${key}`)}
                    </span>
                    <span className="shrink-0 font-serif text-[1.9rem] leading-none tabular-nums text-gold">
                      {today ? today[key] : '—'}
                    </span>
                  </div>
                  {/* min-h so the row does not settle by a line when the
                     countdown arrives with the clock. */}
                  <p className="mt-1 min-h-[1.2rem] font-serif text-[0.95rem] italic leading-tight text-paper/65">
                    {until}
                  </p>
                </li>
              );
            }

            // A hairline between quiet neighbours only. Drawing it against the
            // card would put a rule hard up under a rounded corner, and the
            // card's own edge is already the separation.
            const ruled = i > 0 && win?.next !== ORDER[i - 1];

            return (
              <li
                key={key}
                className={cn(
                  'flex items-baseline justify-between gap-3 py-3.5',
                  ruled && 'border-t border-rule',
                )}
              >
                <span
                  className={cn(
                    'font-mono text-[0.6875rem] uppercase tracking-[0.18em]',
                    // ── PASSED IS GREEN-GREY, NOT PALE GREY (2026-09-30) ──
                    // ink-40 is #A09F9C, a warm grey, and against this warm
                    // paper it read as washed out — the client's word was
                    // dull. ink-60 is #5B6157, which is the site's OWN green:
                    // a desaturated sage that is already the secondary text
                    // colour everywhere else here. Cooler, greener and much
                    // more legible, and it introduces no new brand colour.
                    //
                    // The passed/upcoming distinction survives on the FIGURE
                    // below, which stays ink-60 against ink — the names were
                    // never carrying it alone.
                    passed ? 'text-ink-60' : 'text-ink-60',
                  )}
                >
                  {tv(`names.${key}`)}
                </span>
                <span
                  className={cn(
                    'shrink-0 font-serif text-[1.55rem] leading-none tabular-nums',
                    // Same move on the figure: ink-60's green-grey instead of
                    // ink-40's washed grey, against ink for the ones still to
                    // come. That contrast is what says which have been.
                    passed ? 'text-ink-60' : 'text-ink',
                  )}
                >
                  {today ? today[key] : '—'}
                </span>
                {/* The one part of the row a reader who cannot see the weight
                   has no other way to get. */}
                <span className="sr-only">
                  {passed ? t('statePassed') : t('stateUpcoming')}
                </span>
              </li>
            );
          })}
        </ul>

        {/* ── the six ─────────────────────────────────────────────────── */}
        <ul className="hidden gap-2 px-4 pb-4 md:grid md:grid-cols-6 md:gap-3 md:px-6 md:pb-6">
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
                  <PrayerGlyph
                    prayer={key}
                    className={cn(
                      'h-5 w-5 transition-colors sm:h-6 sm:w-6',
                      isNext ? 'text-gold-deep' : 'text-ink-40',
                    )}
                  />
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
                </div>
              </li>
            );
          })}
        </ul>

        {/* ── progress rail ───────────────────────────────────────────── */}
        {/* max-md:hidden: the masthead's hairline rail is the same number. */}
        <div className="flex items-center gap-4 border-t border-rule px-6 py-3.5 max-md:hidden">
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
         the times on the left, this week's khateeb on the right. Equal-height
         cards, because the grid stretches them. */}
      <div className="grid gap-5 max-md:gap-3 md:grid-cols-[1.35fr_1fr]">
        <section className="relative overflow-hidden rounded-[1.5rem] border border-rule bg-paper-2/60 p-6 max-md:p-5 md:p-8 md:pb-24">
          <p className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-gold-deep">
            <MinaretIcon className="h-4 w-4" />
            {t('jumuahHeading')}
          </p>
          {/* One line per khutba, the time leading and the language after
             it, instead of the two times run together as "14:00 · 15:00"
             (client, 2026-09-02). Which language is at which hour is the
             thing people actually come here to find out, and it was the one
             fact that line did not carry. */}
          <ul className="mt-3 space-y-1 max-md:mt-2">
            {([
              [jumuah[0], t('langNo')],
              [jumuah[1], t('langAr')],
            ] as const).map(([time, lang]) =>
              time ? (
                <li
                  key={time}
                  className="font-serif text-[clamp(1.35rem,2.8vw,1.9rem)] leading-tight text-ink max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-3 max-md:text-[1.2rem]"
                >
                  <span className="tabular-nums">{time}</span>{' '}
                  <span className="text-ink-60">{lang} khutba</span>
                </li>
              ) : null,
            )}
          </ul>

          <p className="mt-3 text-body text-ink-60 max-md:mt-2 max-md:text-[13px]">{t('jumuahNote')}</p>
          <p className="mt-5 inline-flex items-center gap-3 rounded-full border border-rule bg-paper px-4 py-2.5 text-[14px] text-ink max-md:mt-3 max-md:gap-2 max-md:rounded-none max-md:border-0 max-md:bg-transparent max-md:px-0 max-md:py-0 max-md:font-mono max-md:text-[0.625rem] max-md:uppercase max-md:tracking-[0.12em] max-md:text-ink-60">
            <PeopleIcon className="h-4 w-4 shrink-0 text-gold-deep" />
            {t('jumuahImams')}
          </p>
          {/* A skyline along the foot, at 10% ink. The card is taller than its
             own words once it sits beside the timeline, and this fills the
             remainder without adding anything to read. */}
          <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-16 w-full text-gold-deep/15 md:block" />
        </section>

        {/* ── who is giving the khutba ──────────────────────────────── */}
        {/* This card used to be a Friday timetable, which said the same three
           times the card beside it says — two thirds of it was a restatement.
           It answers a question the times cannot instead: who is speaking.
           Photographs, because that is how a congregation recognises a
           khateeb.

           The bio paragraph that ran under the portrait is gone (client:
           "uten tekst"). It was the imams section's own copy repeated
           verbatim, a screen further down the same page, and with two men on
           the card there is no room for two of them. The khutba language
           takes that slot: it is what tells the pair apart, and it is the one
           thing a reader needs here. */}
        <section className="flex flex-col rounded-[1.5rem] border border-rule bg-paper p-6 max-md:p-5 md:p-7">
          <h3 className="font-serif text-[1.2rem] leading-none text-ink">{t('khateebLabel')}</h3>
          <ul className="flex flex-1 flex-col justify-center divide-y divide-rule max-md:grid max-md:grid-cols-2 max-md:gap-3 max-md:divide-y-0 max-md:pt-3">
            {khateebs.map(({ imam, khutba }) => (
              <li key={imam.key} className="flex items-center gap-4 py-5 max-md:flex-col max-md:items-start max-md:gap-2 max-md:py-0 md:gap-5">
                {/* The portraits are square crops crested on the face, so a
                   circle sits right on them. A missing photo falls back to the
                   initial rather than to a broken frame. */}
                <span className="relative flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center overflow-hidden rounded-full bg-paper-2 ring-1 ring-rule max-md:h-12 max-md:w-12 md:h-[4.75rem] md:w-[4.75rem]">
                  {imam.photo ? (
                    <Image src={imam.photo} alt="" fill sizes="76px" className="object-cover" />
                  ) : (
                    <span className="font-serif text-[1.5rem] text-gold-deep">
                      {imam.name.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-[clamp(1.1rem,2.1vw,1.35rem)] leading-tight text-ink">
                    <span className="opacity-70">{imam.title}</span> {imam.name}
                  </span>
                  <span className="mt-1.5 block font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-gold-deep">
                    {t(khutba)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/* ── marks ─────────────────────────────────────────────────────────────── */

export function ClockIcon({ className }: { className?: string }) {
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

function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9.5" r="2.3" />
      <path d="M14.5 19a4.6 4.6 0 0 1 6-4.3" />
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
export function PrayerGlyph({ prayer, className }: { prayer: PrayerKey; className?: string }) {
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
  // Six prayers, six marks (client, 2026-09-04: "endre symbolene på de
  // ulike bønnetidene" — three of these used to be shared). Each draws the
  // sky at that hour: light before the sun, the sun arriving, high, past
  // its height, leaving, and the night.
  if (prayer === 'fajr') {
    // First light: the horizon glows, the sun itself is not up yet.
    return (
      <svg {...common}>
        <path d="M4 17.5h16" />
        <path d="M12 13v-3.5M7.4 14.4 5.9 12.9M16.6 14.4l1.5-1.5" />
      </svg>
    );
  }
  if (prayer === 'sunrise') {
    // The sun breaking the horizon, on its way up.
    return (
      <svg {...common}>
        <path d="M4 17.5h16" />
        <path d="M8 17.5a4 4 0 0 1 8 0" />
        <path d="M12 10V4.5M9.6 6.9 12 4.5l2.4 2.4" />
      </svg>
    );
  }
  if (prayer === 'dhuhr') {
    // Midday: the full sun, high.
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
      </svg>
    );
  }
  if (prayer === 'asr') {
    // Afternoon: the sun whole but low, the horizon already in the frame.
    return (
      <svg {...common}>
        <circle cx="12" cy="10.5" r="3.5" />
        <path d="M4 17.5h16" />
        <path d="M12 3.5V2M6.6 5.1 5.5 4M17.4 5.1 18.5 4" />
      </svg>
    );
  }
  if (prayer === 'maghrib') {
    // Sunset: the sun half gone, going down.
    return (
      <svg {...common}>
        <path d="M4 17.5h16" />
        <path d="M8 17.5a4 4 0 0 1 8 0" />
        <path d="M12 4v5.5M9.6 7.1 12 9.5l2.4-2.4" />
      </svg>
    );
  }
  // isha — the crescent, with one star beside it.
  return (
    <svg {...common}>
      <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a8 8 0 1 0 9.5 9.5Z" />
      <path d="M18 4v2.4M16.8 5.2h2.4" />
    </svg>
  );
}
