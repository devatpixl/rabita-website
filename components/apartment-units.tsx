'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { APARTMENT_UNITS, unitFace, unitPlan, type ApartmentUnit } from '@/lib/apartment-units';
import { SectionBody } from './primitives';
import { Accent } from './accent';
import { Reveal } from './reveal';
import { cn } from '@/lib/cn';

// The apartments, one card each, opening the architect's plan sheet
// (client, 2026-09-13). This stands where "sentral beliggenhet" stood: that
// section made four claims about the neighbourhood, and a buyer on this page
// has already been told where the building is twice.
//
// The card register is the gift ladder's, which the client pointed at as the
// look he wanted: a photograph going dark at the foot, a gold rule, a serif
// figure, and the words sitting on the picture. What it is NOT is the
// reference site's treatment — a green price bar clamped over every thumbnail
// — because a price band that colour on this palette reads as a supermarket
// shelf tag.
//
// The figures are never translated, only their labels: every number comes off
// the plan sheet and has to be the same number in Norwegian, English and
// Arabic. `nb-NO` grouping throughout, which is what the sheet and the price
// list use.

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-paper/10 py-2.5 last:border-0">
      <dt className="text-[0.8125rem] text-paper/60">{label}</dt>
      <dd className="text-end font-mono text-[0.8125rem] tabular-nums text-paper">{value}</dd>
    </div>
  );
}

export function ApartmentUnits() {
  const t = useTranslations('apartmentsPage.units');
  const [open, setOpen] = useState<ApartmentUnit | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // A rail, not a grid (client, 2026-09-13), matching the gift ladder he
  // pointed at. Twelve plates in a grid is four rows of wall; on a rail they
  // are one gesture.
  const n = APARTMENT_UNITS.length;
  const [active, setActive] = useState(0);
  const wrap = (i: number) => ((i % n) + n) % n;
  /** Absolute — the dots. */
  const go = useCallback((to: number) => setActive(wrap(to)), [n]); // eslint-disable-line react-hooks/exhaustive-deps
  /** Relative — the arrows. Functional update, NOT go(active + 1): `active`
   *  in that expression is the value captured by the render the click handler
   *  was created in, so two clicks before React re-renders both compute the
   *  same next index and the rail advances once. Measured: three clicks in a
   *  row moved it one card. */
  const step = useCallback((delta: number) => setActive((a) => wrap(a + delta)), [n]); // eslint-disable-line react-hooks/exhaustive-deps

  // Move the RAIL's own scrollLeft, never el.scrollIntoView(). That walks up
  // and scrolls every scrollable ancestor including the document, and running
  // on mount it drops the reader down the page into this section — exactly
  // the bug the gift ladder had on 2026-09-13. The mount guard skips the
  // first run, where card 0 is already where the rail starts.
  const railRef = useRef<HTMLUListElement>(null);
  const railMounted = useRef(false);
  useEffect(() => {
    if (!railMounted.current) {
      railMounted.current = true;
      return;
    }
    const rail = railRef.current;
    const el = rail?.children[active] as HTMLElement | undefined;
    if (!rail || !el) return;
    // ALWAYS bring the active card to the rail's start — do not "nudge only
    // if it is out of view". Three cards are visible at desktop width, so the
    // nudge version did nothing for the first three clicks and only began
    // moving at card four: the arrow looked broken until you had pressed it
    // three times (client, 2026-09-13). Aligning every time means one press
    // is always one card.
    const left = Math.max(0, el.offsetLeft - rail.offsetLeft - 4);
    rail.scrollTo({ left, behavior: 'smooth' });
  }, [active]);
  const nf = new Intl.NumberFormat('nb-NO');
  const num = (n: number) => nf.format(n);
  // Ceiling heights keep both decimals — the plan sheet says "ca 2,40 m", and
  // plain formatting drops the trailing zero to "2,4", which reads as a
  // different, less precise measurement than the architect gave.
  const nf2 = new Intl.NumberFormat('nb-NO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const metres = (n: number) => nf2.format(n);

  // Escape closes; the scroll lock goes on the documentElement, because
  // globals.css sets overflow-x: clip on html and that makes html the
  // scrolling element — locking body alone does nothing (learned the hard way
  // on the room-photo dialog, 2026-09-13).
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <section className="relative isolate overflow-hidden bg-dusk py-section-md text-paper">
      {/* His own interior behind the plates (client, 2026-09-13). It is dark
         navy and almost empty through the middle, with the arch, the hanging
         stars and the planting at the edges — so the cards sit in the quiet
         part and the detail frames them. object-cover with the focus held
         left of centre, because the right third is where the arch is and the
         rail starts at the inline start. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/photos/apartments-bg.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[35%_50%]"
        />
        {/* A dusk wash so the ground never competes with twelve photographs
           stacked along it. */}
        <div className="absolute inset-0 bg-dusk/55" />
      </div>
      <SectionBody className="relative">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
          {t('eyebrow')}
        </p>
        <h2 className="mt-4 max-w-2xl font-serif text-section text-balance text-paper">
          {t.rich('heading', { em: (chunks) => <Accent surface="dusk">{chunks}</Accent> })}
        </h2>
        <p className="mt-4 max-w-[52ch] text-body text-paper/70">{t('lede')}</p>

        <div className="relative mt-10 md:mt-14">
          {/* Arrows in the page gutter rather than over the plates — at
             -inset-x-14 they clear the rail by 8px at 1280 and 48px at 1920.
             Below xl there is no gutter to use and the rail swipes. */}
          <div className="pointer-events-none absolute inset-y-0 -inset-x-14 z-20 hidden items-center justify-between xl:flex">
            <RailArrow dir="prev" label={t('prev')} onClick={() => step(-1)} />
            <RailArrow dir="next" label={t('next')} onClick={() => step(1)} />
          </div>

          <ul
            ref={railRef}
            className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 pt-1 sm:gap-5"
          >
          {APARTMENT_UNITS.map((u, i) => (
            <Reveal
              as="li"
              key={u.id}
              delay={Math.min(i, 3) * 0.08}
              className="w-[76%] shrink-0 snap-center sm:w-[20rem] lg:w-[18.5rem] xl:w-[20rem]"
            >
              <button
                type="button"
                // NO onFocus={() => setActive(i)} here, however tempting it
                // is for keeping the dots in step with keyboard focus. Focus
                // fires on MOUSEDOWN, so it scrolled the rail out from under
                // the pointer and the mouseup landed on a different element —
                // which means no click event at all. Clicking any card that
                // was not already aligned just slid the rail and never opened
                // the plan (client, 2026-09-13: "im clicking on right side
                // cards, it swaps right"). Browsers already scroll a focused
                // element into view inside its own scroll container, so
                // keyboard users lose nothing.
                onClick={() => setOpen(u)}
                aria-label={`${t(`items.${u.id}.title`)} — ${t('openLabel')}`}
                className="group/unit relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden rounded-2xl bg-ink text-start ring-1 ring-inset ring-paper/10 transition-[box-shadow] duration-300 ease-out hover:ring-gold/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <span aria-hidden className="absolute inset-0">
                  <Image
                    src={unitFace(u.id)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw"
                    className={cn(
                      'object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/unit:scale-[1.04]',
                      // Sold: the render steps back rather than going grey.
                      // Full grayscale among twelve warm renders reads as a
                      // broken image, not as a status; 0.5 saturation reads
                      // as "past tense" and keeps the card in the family.
                      u.sold && 'saturate-[0.5]',
                    )}
                  />
                </span>
                {/* Two stacked scrims rather than one that changes: a
                   background-image cannot transition its own stops. */}
                <span
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(22,36,46,0) 30%, rgba(22,36,46,0.55) 58%, rgba(22,36,46,0.93) 86%, rgba(22,36,46,0.97) 100%)',
                  }}
                />
                <span
                  aria-hidden
                  className="absolute inset-0 opacity-0 transition-opacity duration-[420ms] ease-out group-hover/unit:opacity-100 group-focus-visible/unit:opacity-100"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(22,36,46,0.1) 20%, rgba(22,36,46,0.68) 55%, rgba(22,36,46,0.97) 88%, rgba(22,36,46,0.99) 100%)',
                  }}
                />

                {/* SOLGT — a STAMP, not a label.
                   
                   The first version was a filled gold pill and it was wrong:
                   a solid block of #C0A165 sitting on a warm interior render
                   reads as a sticker someone slapped on the photograph, and
                   it fought every frame it landed on.
                   
                   What it is now: outlined, not filled. A gold hairline and
                   gold type over a frosted panel, tilted a few degrees off
                   true. Three reasons that works better —
                   
                     GLASS, not paint. bg-dusk/85 + backdrop-blur means the
                     mark makes its own ground out of whatever is behind it,
                     so it is legible on the dark H607 hallway AND the bright
                     H506 living room without a per-photo value. 85 and not
                     45: at 45 the panel went light grey over a white ceiling
                     and the gold type washed out into it — measured on H506,
                     whose render opens on a lit ceiling. The rail's
                     own arrows already use this idiom (bg-dusk/70 +
                     backdrop-blur-sm), so it is the site's vocabulary.
                     
                     OUTLINE, not fill. The photograph stays visible through
                     it. A sold flat is still worth looking at — it is the
                     proof that these sell — and a solid chip hides the very
                     thing it is bragging about.
                     
                     TILT. -8deg is the one thing here that is not systematic,
                     and that is the point: everything else on this site sits
                     exactly on its grid, so a few degrees off reads as
                     something pressed onto the card after the fact. Which is
                     what a sold stamp is.
                   
                   Still gold and not red. `alert` is the site's ONE red and
                   it is reserved for things that have gone wrong; a sale is
                   the opposite of a failure.
                   
                   `start-4` and `rtl:rotate-[6deg]`: the mark mirrors to the
                   other corner in Arabic, and the tilt mirrors with it, so it
                   leans INTO the card in both directions rather than off it. */}
                {u.sold && (
                  <span
                    className="absolute start-4 top-4 z-10 -rotate-[8deg] rounded-[2px] border border-gold/70 bg-dusk/85 px-3 py-1.5 font-mono text-[0.625rem] font-medium uppercase leading-none tracking-[0.32em] text-gold-soft shadow-[0_4px_16px_-6px_rgba(22,36,46,0.85)] backdrop-blur-[8px] rtl:rotate-[8deg]"
                  >
                    {t('sold')}
                  </span>
                )}

                <span className="relative z-10 p-5 sm:p-6">
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.18em] tabular-nums text-gold-soft">
                      {u.unit}
                    </span>
                    <span
                      aria-hidden
                      className="h-px w-8 bg-gold-soft/55 transition-[width] duration-[320ms] ease-out group-hover/unit:w-14 group-focus-visible/unit:w-14"
                    />
                  </span>
                  <span className="mt-3 block font-serif text-[clamp(1.5rem,2.4vw,1.9rem)] leading-none text-paper">
                    {num(u.priceNok)}{' '}
                    <span className="font-sans text-[0.8em] text-paper/70">kr</span>
                  </span>
                  <span className="mt-2.5 block font-serif text-[1.05rem] leading-snug text-paper">
                    {t(`items.${u.id}.title`)}
                  </span>
                  <span className="mt-2 block font-mono text-[0.6875rem] tabular-nums tracking-[0.1em] text-paper/60">
                    {t('sqm', { n: num(u.braM2) })} · {t('labels.floor')} {u.floor}
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
          </ul>

          {/* Dots, so the rail says how long it is on a phone where the
             arrows are not there. */}
          <ol className="mt-5 flex items-center justify-center gap-2 xl:hidden">
            {APARTMENT_UNITS.map((u, i) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={u.unit}
                  aria-current={i === active ? 'true' : undefined}
                  className="grid h-7 w-5 place-items-center"
                >
                  <span
                    className={cn(
                      'block h-[2px] rounded-full transition-all',
                      i === active ? 'w-5 bg-gold' : 'w-2.5 bg-paper/25',
                    )}
                  />
                </button>
              </li>
            ))}
          </ol>
        </div>
      </SectionBody>

      {/* ── the plan sheet ───────────────────────────────────────────────
         PORTALLED TO document.body, and it has to be. This section carries
         `isolate` for the background layer, which creates a stacking context
         — and z-index resolves inside the nearest stacking context, so
         z-[80] only ever meant "above the rest of this section". `fixed`
         does not help: it escapes the containing block for layout, not the
         stacking context for painting. The render gallery below is a later
         sibling, so it painted straight over the open dialog (client,
         2026-09-13: "the section below is interfering with pop up").

         Only mounted after a click, so document exists by then. */}
      {open &&
        createPortal((
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.sold ? `${t(`items.${open.id}.title`)} — ${t('sold')}` : t(`items.${open.id}.title`)}
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto overscroll-contain bg-dusk/70 p-4 backdrop-blur-[3px] sm:p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(null);
          }}
        >
          <div className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-dusk ring-1 ring-inset ring-paper/12">
            <div className="flex items-center justify-between gap-4 border-b border-paper/10 px-5 py-3.5 sm:px-7">
              {/* Title and status together. The plan sheet fills the frame
                 below, so on a phone this bar is the whole of what is on
                 screen when the dialog opens — which makes it the only place
                 the sold state is guaranteed to be read (client, 2026-09-18:
                 "also mention here that sold when we open them"). The price
                 further down would be below the fold.
                 
                 Same materials as the stamp on the card — gold hairline, dusk
                 fill, letterspaced mono — but NOT tilted. The tilt works on a
                 photograph, where it reads as something pressed onto the
                 image; in a ruled UI bar next to aligned type it would read
                 as a rendering fault. Same mark, right register. */}
              <p className="flex min-w-0 items-center gap-3 font-serif text-[1.05rem] text-paper">
                <span className="truncate">{t(`items.${open.id}.title`)}</span>
                {open.sold && (
                  <span className="shrink-0 rounded-[2px] border border-gold/70 bg-dusk px-2 py-1 font-mono text-[0.5625rem] font-medium uppercase leading-none tracking-[0.28em] text-gold-soft">
                    {t('sold')}
                  </span>
                )}
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(null)}
                aria-label={t('closeLabel')}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 ring-inset ring-paper/25 text-paper transition-colors hover:bg-paper hover:text-dusk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <span aria-hidden className="text-[1.1rem] leading-none">&times;</span>
              </button>
            </div>

            {/* The sheet itself. object-contain, never cover: a floor plan
               that is cropped is a floor plan that lies. */}
            <div className="relative aspect-[1024/724] w-full bg-paper-2">
              <Image
                src={unitPlan(open.id)}
                alt={t('planAlt', { unit: open.unit })}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-contain"
              />
            </div>

            <div className="px-5 py-6 sm:px-7 sm:py-7">
              <p className="max-w-[60ch] text-body text-paper/75">
                {t(`items.${open.id}.lede`)}
              </p>
              <p className="mt-5 font-serif text-[1.6rem] leading-none text-paper">
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
                  {t('price')}
                </span>
                <span className="mt-2 block">
                  {num(open.priceNok)} <span className="font-sans text-[0.7em] text-paper/70">kr</span>
                </span>
              </p>

              <p className="mt-7 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-soft">
                {t('keyInfo')}
              </p>
              <dl className="mt-2">
                <Row label={t('labels.floor')} value={String(open.floor)} />
                <Row label={t('labels.bra')} value={t('sqm', { n: num(open.braM2) })} />
                <Row label={t('labels.prom')} value={t('sqm', { n: num(open.pRomM2) })} />
                {/* Only when the flat HAS one. H607 has no balcony, and a
                   rendered "0 m²" states a balcony of zero square metres
                   rather than the absence of a balcony. */}
                {open.balconyM2 !== null && (
                  <Row label={t('labels.balcony')} value={t('sqm', { n: num(open.balconyM2) })} />
                )}
                <Row
                  label={t('labels.ceilingGeneral')}
                  value={t('approx', { m: metres(open.ceilingGeneralM) })}
                />
                <Row
                  label={t('labels.ceilingBath')}
                  value={t('approx', { m: metres(open.ceilingBathM) })}
                />
                <Row
                  label={t('labels.ceilingHall')}
                  value={t('approx', { m: metres(open.ceilingHallM) })}
                />
              </dl>
            </div>
          </div>
        </div>
        ),
        document.body,
      )}
    </section>
  );
}

function RailArrow({ dir, label, onClick }: { dir: 'prev' | 'next'; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-paper/30 bg-dusk/70 text-paper backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold hover:text-dusk"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn('h-4 w-4', dir === 'prev' ? 'rtl:rotate-180' : 'rotate-180 rtl:rotate-0')}
        aria-hidden
      >
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </button>
  );
}
