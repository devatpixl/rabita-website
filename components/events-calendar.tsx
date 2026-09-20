'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { EVENT_PAGES } from '@/lib/event-pages';
import { hijriDate, hijriParts, islamicDateOn, type IslamicDateKey } from '@/lib/hijri';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

// The month calendar under the event cards (client, 2026-09-16), and the
// referat's own Om oss line from 14 September: "Legge til kalender med
// aktuelle aktiviteter (idfeiringer, kurs, aktiviteter osv.) – klikk på
// aktivitet viser info".
//
// ── WHY THE ISLAMIC DATES ARE COMPUTED, NOT LISTED ────────────────────────
// Three events across a year would be a nearly empty grid, and the referat
// asks for "idfeiringer" alongside them. So the calendar carries the dates
// the congregation's year actually turns on — Ramadan, the two Eids, Ashura,
// Mawlid, Laylat al-Qadr, the new year — derived from the Hijri calendar in
// lib/hijri.ts rather than typed into a table. A hardcoded list of Gregorian
// dates goes stale every year and does it silently, which on a mosque's
// calendar is the worst kind of wrong.
//
// Umm al-Qura is astronomical, and Rabita may announce Eid a day either side
// on local sighting, so the panel says these are expected dates rather than
// stating them as fact.
//
// ── MONDAY FIRST, IN EVERY LOCALE ─────────────────────────────────────────
// Including Arabic, where the week conventionally opens on Saturday. This is
// an Oslo congregation reading an Oslo calendar next to Norwegian school
// terms and Friday prayer; a grid that reshuffles itself per language would
// make the same month look like two different months. Intl.Locale.weekInfo
// would give the "correct" per-locale answer and is deliberately not used.

type DayCell = {
  date: Date;
  inMonth: boolean;
  iso: string;
  hijriDay: number | null;
  observance: IslamicDateKey | null;
  events: typeof EVENT_PAGES;
};

const isoOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Monday=0 … Sunday=6, from JS's Sunday=0. */
const mondayIndex = (d: Date) => (d.getDay() + 6) % 7;

export function EventsCalendar() {
  const t = useTranslations('eventsCalendar');
  const te = useTranslations('eventsPage');
  const locale = useLocale() as AppLocale;
  const reduced = useReducedMotion();

  const tag = locale === 'en' ? 'en-GB' : locale === 'ar' ? 'ar-EG' : 'nb-NO';

  // `null` until mount. These pages are statically generated, so a date read
  // during render is the BUILD date — the same trap lib/hijri.ts documents.
  // Everything that depends on "today" stays inert for one paint rather than
  // rendering a stale month and correcting itself.
  const [today, setToday] = useState<Date | null>(null);
  const [cursor, setCursor] = useState<{ y: number; m: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);

  useEffect(() => {
    const now = new Date();
    setToday(now);
    // THIS MONTH, always (client, 2026-09-16: "when i opened the page, show
    // calendar month current, not any other").
    //
    // It opened on the month of the next EVENT until then, on the reasoning
    // that three events a year leaves today's month usually empty and an
    // empty grid undersells a calendar that does have things in it. That
    // reasoning was wrong about which question the reader is asking. A
    // calendar that opens on a month you did not choose has to be read twice
    // — once to work out where you are, once for what is on — and "where am
    // I" is not a question a calendar should ever provoke. Today is the only
    // month the reader can orient in without being told.
    //
    // The months with something in them are one arrow or one swipe away, and
    // the marks make them obvious the moment you get there.
    setCursor({ y: now.getFullYear(), m: now.getMonth() });
  }, []);

  const move = useCallback((delta: 1 | -1) => {
    setDir(delta);
    setCursor((c) => {
      if (!c) return c;
      // Through Date rather than (m + delta) % 12, so December -> January
      // carries the year with it.
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }, []);

  // ── the grid ────────────────────────────────────────────────────────────
  const cells = useMemo<DayCell[]>(() => {
    if (!cursor) return [];
    const first = new Date(cursor.y, cursor.m, 1);
    const start = new Date(first);
    start.setDate(1 - mondayIndex(first));
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const iso = isoOf(date);
      return {
        date,
        iso,
        inMonth: date.getMonth() === cursor.m,
        hijriDay: hijriParts(date)?.day ?? null,
        observance: islamicDateOn(date),
        events: EVENT_PAGES.filter((e) => e.date === iso),
      };
    });
  }, [cursor]);

  // Arabic reads Arabic-Indic digits, and Intl already gives them in the
  // month header — so a grid of Latin numerals under an Arabic-Indic heading
  // was the page contradicting itself in two scripts. Every numeral in the
  // calendar now goes through the same formatter.
  const num = useMemo(() => new Intl.NumberFormat(tag), [tag]);

  const weekdays = useMemo(() => {
    const f = new Intl.DateTimeFormat(tag, { weekday: 'short' });
    // 2024-01-01 was a Monday.
    return Array.from({ length: 7 }, (_, i) => f.format(new Date(2024, 0, 1 + i)));
  }, [tag]);

  const monthLabel = useMemo(() => {
    if (!cursor) return '';
    return new Intl.DateTimeFormat(tag, { month: 'long', year: 'numeric' }).format(
      new Date(cursor.y, cursor.m, 1),
    );
  }, [cursor, tag]);

  // The Hijri months the visible Gregorian month straddles — almost always
  // two, which is the point of showing it at all.
  const hijriLabel = useMemo(() => {
    if (!cursor) return '';
    const a = hijriDate(locale, new Date(cursor.y, cursor.m, 1));
    const b = hijriDate(locale, new Date(cursor.y, cursor.m + 1, 0));
    const strip = (s: string) => s.replace(/^\d+[.\s]*/, '').trim();
    const [sa, sb] = [strip(a), strip(b)];
    return sa === sb ? sa : `${sa} – ${sb}`;
  }, [cursor, locale]);

  const selectedCell = cells.find((c) => c.iso === selected) ?? null;

  // ── swipe ───────────────────────────────────────────────────────────────
  // Horizontal only, and only past 48px, so a vertical page scroll that
  // wanders a few pixels sideways never flips the month.
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    // In RTL the gesture reads the other way round.
    const rtl = locale === 'ar';
    move(dx < 0 ? (rtl ? -1 : 1) : rtl ? 1 : -1);
  };

  // ── keyboard ────────────────────────────────────────────────────────────
  // Roving tabindex: one stop for the whole grid, arrows inside it. 42 tab
  // stops is not a calendar, it is a maze.
  const onKeyDown = (e: React.KeyboardEvent, cell: DayCell) => {
    const step: Record<string, number> = {
      ArrowRight: locale === 'ar' ? -1 : 1,
      ArrowLeft: locale === 'ar' ? 1 : -1,
      ArrowDown: 7,
      ArrowUp: -7,
    };
    if (e.key in step) {
      e.preventDefault();
      const next = new Date(cell.date);
      next.setDate(next.getDate() + step[e.key]);
      setSelected(isoOf(next));
      if (next.getMonth() !== cursor?.m) move(step[e.key] > 0 ? 1 : -1);
      requestAnimationFrame(() => {
        document.querySelector<HTMLButtonElement>(`[data-day="${isoOf(next)}"]`)?.focus();
      });
    }
    if (e.key === 'PageDown') { e.preventDefault(); move(1); }
    if (e.key === 'PageUp') { e.preventDefault(); move(-1); }
  };

  const todayIso = today ? isoOf(today) : null;
  const focusIso = selected ?? cells.find((c) => c.inMonth && c.iso === todayIso)?.iso
    ?? cells.find((c) => c.inMonth && (c.events.length || c.observance))?.iso
    ?? cells.find((c) => c.inMonth)?.iso;

  // id: the "Kalender →" button in the events section above this one on
  // /aktuelt scrolls here. scroll-mt clears the sticky header, or the
  // heading lands underneath it.
  return (
    <section id="kalender" className="star-texture star-texture--light relative isolate scroll-mt-24 overflow-hidden bg-paper-2 py-14 text-ink md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* ── header ──────────────────────────────────────────────────── */}
        {/* One block, not a two-up: the month control that used to sit
           opposite the heading has moved down onto the calendar box. */}
        <div>
          <div>
            <p className="flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
              <span aria-hidden className="h-px w-6 shrink-0 bg-gold-deep/50" />
              {t('eyebrow')}
            </p>
            <h2 className="mt-4 font-serif text-section leading-[1.12] text-balance text-ink">
              {t('heading')}
            </h2>
            <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-ink-60">
              {t('lede')}
            </p>
          </div>
        </div>

        {/* ── the grid ────────────────────────────────────────────────── */}
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            {/* ── Month control, directly over the box it drives ─────────
               Client, Tekst (endelig) Sept 2026: "Månedsnavnet skal
               plasseres rett over selve kalenderboksen — gir mer mening der
               enn der det står i dag."

               It used to sit in the section header, opposite the heading —
               full width, while the box it belongs to is seven of twelve
               columns and starts lower down. The label and the grid it
               names were in two different places on the page.

               justify-between rather than the old centred huddle: on the
               column's own width the arrows belong on its edges, which is
               also where a thumb expects them. The Hijri range stays under
               the month, which is the point of this calendar. */}
            <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
              <NavButton label={t('prev')} onClick={() => move(-1)} dirIcon="prev" />
              <div className="min-w-0 text-center">
                <p className="font-serif text-[1.15rem] leading-tight text-ink first-letter:uppercase sm:text-[1.3rem]">
                  {monthLabel || ' '}
                </p>
                <p className="mt-0.5 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-gold-deep">
                  {hijriLabel || ' '}
                </p>
              </div>
              <NavButton label={t('next')} onClick={() => move(1)} dirIcon="next" />
            </div>
            <div
              className="overflow-hidden rounded-[1.5rem] bg-paper p-3 ring-1 ring-ink/8 sm:p-5"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {weekdays.map((w) => (
                  <div
                    key={w}
                    className="pb-2 text-center font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-40 sm:text-[0.625rem]"
                  >
                    {w}
                  </div>
                ))}
              </div>

              {/* GUARDED ON `cursor`, and that is a bug fix rather than tidying.
                 The key used to fall back to 'empty' while cursor was null,
                 which it always is on the first render — these pages are
                 statically generated and the month is only known after the
                 mount effect. So every page load mounted a throwaway empty
                 child, and then AnimatePresence with mode="wait" held the
                 REAL grid back until that empty one had finished animating
                 out. One wasted transition on every load at best, and if the
                 exit stalled the calendar never appeared at all — measured
                 mid-stall at opacity 0.068, translateX(-22.4px), zero cells.
                 Rendering nothing until there is a month to render means the
                 first real child mounts under initial={false} and is simply
                 there, with no swap to wait for. */}
              {!cursor ? (
                // Holds the grid's height so the panel beside it does not
                // jump when the month arrives.
                <div aria-hidden className="h-[15.5rem] sm:h-[17.5rem]" />
              ) : (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${cursor.y}-${cursor.m}`}
                  initial={reduced ? false : { opacity: 0, x: dir * 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir * -24 }}
                  transition={{ duration: reduced ? 0.12 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-7 gap-1 sm:gap-1.5"
                  role="grid"
                  aria-label={t('gridLabel', { month: monthLabel })}
                >
                  {cells.map((c) => (
                    <DayButton
                      key={c.iso}
                      cell={c}
                      num={num}
                      isToday={c.iso === todayIso}
                      isSelected={c.iso === selected}
                      tabbable={c.iso === focusIso}
                      onSelect={() => setSelected(c.iso)}
                      onKeyDown={(e) => onKeyDown(e, c)}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
              )}
            </div>

            {/* Legend + a way back to today. */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Key className="ring-[1.5px] ring-inset ring-gold-deep" label={t('legendEvent')} />
              <Key className="bg-sage ring-1 ring-sage-line" label={t('legendIslamic')} />
              <Key className="bg-gold-deep" label={t('legendToday')} />
              <button
                type="button"
                onClick={() => {
                  if (!today) return;
                  setDir(1);
                  setCursor({ y: today.getFullYear(), m: today.getMonth() });
                  setSelected(isoOf(today));
                }}
                className="ms-auto font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-60 underline decoration-gold-deep/40 underline-offset-4 transition-colors hover:text-gold-deep"
              >
                {t('today')}
              </button>
            </div>
          </div>

          {/* ── the day panel ─────────────────────────────────────────── */}
          <div className="lg:col-span-5">
            <DayPanel
              cell={selectedCell}
              locale={locale}
              tag={tag}
              t={t}
              te={te}
              isToday={selectedCell?.iso === todayIso}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── one square ────────────────────────────────────────────────────────────
function DayButton({
  cell,
  num,
  isToday,
  isSelected,
  tabbable,
  onSelect,
  onKeyDown,
}: {
  cell: DayCell;
  num: Intl.NumberFormat;
  isToday: boolean;
  isSelected: boolean;
  tabbable: boolean;
  onSelect: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const marked = cell.events.length > 0;
  return (
    <button
      type="button"
      role="gridcell"
      data-day={cell.iso}
      tabIndex={tabbable ? 0 : -1}
      aria-selected={isSelected}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className={cn(
        // rounded-FULL, not rounded-xl. The cell is already aspect-square, so
        // a full radius makes it a true circle — which is what lets the event
        // ring read as a ring around the date (client, 2026-09-16: "maybe
        // circle rings around the date better to show that an event on that
        // day?") rather than as a box around a square.
        'relative flex aspect-square flex-col items-center justify-center rounded-full transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep focus-visible:ring-offset-1',
        !cell.inMonth && 'opacity-30',
        isSelected
          ? 'bg-dusk text-paper'
          : cell.observance
          ? 'bg-sage text-ink hover:bg-sage-line'
          : 'text-ink hover:bg-paper-2',
        // THE EVENT MARK. A ring around the whole date, which is the one
        // signal on this grid you can read without having learned it first —
        // a 4px dot under a numeral is a footnote and reads as dirt at a
        // glance. inset ring so it never clips against the neighbouring cell.
        marked && !isSelected && 'ring-[1.5px] ring-inset ring-gold-deep',
        marked && isSelected && 'ring-[1.5px] ring-inset ring-gold',
      )}
    >
      <span
        className={cn(
          'font-serif text-[0.95rem] leading-none tabular-nums sm:text-[1.05rem]',
          isToday && !isSelected && 'text-gold-deep',
        )}
      >
        {num.format(cell.date.getDate())}
      </span>
      {/* The Hijri day, always — it is the reason this is a mosque's
         calendar and not a date picker. */}
      <span
        className={cn(
          'mt-0.5 font-mono text-[0.5rem] leading-none tabular-nums sm:text-[0.5625rem]',
          isSelected ? 'text-paper/60' : 'text-ink-40',
        )}
      >
        {cell.hijriDay === null ? '' : num.format(cell.hijriDay)}
      </span>
      {/* TODAY TAKES THE DOT the event mark just gave up. It used to be a
         ring, and two different rings on one grid — one meaning "now", one
         meaning "something is on" — is a legend nobody reads. Today already
         has the numeral in gold-deep; the dot is the second half of that one
         signal, not a competing one. */}
      {isToday && (
        <span
          aria-hidden
          className={cn(
            'absolute bottom-1 h-1 w-1 rounded-full sm:bottom-1.5 sm:h-1.5 sm:w-1.5',
            isSelected ? 'bg-gold' : 'bg-gold-deep',
          )}
        />
      )}
    </button>
  );
}

function Key({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[12px] text-ink-60">
      <span aria-hidden className={cn('h-2.5 w-2.5 rounded-full', className)} />
      {label}
    </span>
  );
}

function NavButton({
  label,
  onClick,
  dirIcon,
}: {
  label: string;
  onClick: () => void;
  dirIcon: 'prev' | 'next';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full ring-1 ring-ink/12 text-ink transition-colors hover:border-gold-deep hover:bg-gold-deep hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep"
    >
      <span aria-hidden className={cn('text-[1.1rem] leading-none', 'rtl:rotate-180')}>
        {dirIcon === 'prev' ? '‹' : '›'}
      </span>
    </button>
  );
}

// ── what is on the chosen day ─────────────────────────────────────────────
function DayPanel({
  cell,
  locale,
  tag,
  t,
  te,
  isToday,
}: {
  cell: DayCell | null;
  locale: AppLocale;
  tag: string;
  t: ReturnType<typeof useTranslations>;
  te: ReturnType<typeof useTranslations>;
  isToday: boolean;
}) {
  if (!cell) {
    return (
      <div className="flex h-full min-h-[14rem] flex-col justify-center rounded-[1.5rem] border border-dashed border-ink/15 px-7 py-8 text-center">
        <p className="font-serif text-[1.15rem] leading-snug text-ink-60">{t('pickPrompt')}</p>
      </div>
    );
  }

  const long = new Intl.DateTimeFormat(tag, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(cell.date);

  return (
    <div className="h-full rounded-[1.5rem] bg-paper p-7 ring-1 ring-ink/8">
      <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-gold-deep">
        {isToday ? t('today') : t('selected')}
      </p>
      <p className="mt-2 font-serif text-[1.35rem] leading-tight text-ink first-letter:uppercase">
        {long}
      </p>
      <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-40">
        <bdi>{hijriDate(locale, cell.date)}</bdi>
      </p>

      <div className="mt-6 space-y-4 border-t border-rule pt-6">
        {cell.observance && (
          <div>
            <p className="font-serif text-[1.05rem] leading-snug text-ink">
              {t(`islamic.${cell.observance}`)}
            </p>
            {/* Never stated as fact — Umm al-Qura is astronomical and the
               mosque may announce on sighting. */}
            <p className="mt-1 text-[13px] leading-snug text-ink-60">{t('observanceNote')}</p>
          </div>
        )}

        {cell.events.map((e) => (
          <Link
            key={e.slug}
            href={`/${locale}/arrangementer/${e.slug}`}
            className="group flex items-start gap-2.5 text-ink"
          >
            <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep" />
            <span className="min-w-0">
              <span className="block font-serif text-[1.05rem] leading-snug transition-colors group-hover:text-gold-deep">
                {te(`items.${e.key}.title`)}
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-ink-60">
                {te(`items.${e.key}.body`)}
              </span>
              <span className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-gold-deep">
                {te('rsvp')}
                <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180">
                  &rarr;
                </span>
              </span>
            </span>
          </Link>
        ))}

        {!cell.observance && cell.events.length === 0 && (
          <p className="text-[14px] leading-snug text-ink-60">{t('emptyDay')}</p>
        )}
      </div>
    </div>
  );
}
