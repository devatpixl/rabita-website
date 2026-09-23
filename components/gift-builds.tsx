'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useInView, useReducedMotion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { GIFT_SECTIONS, giftsIn, type Gift, type GiftKey } from '@/lib/gifts';
import { formatAmount } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { Accent } from './accent';
import { Reveal } from './reveal';
import { SectionBody } from './primitives';
import { openGiveSheet } from './giving-sheet';

// What your gift builds — the client's six levels, in his two sections, on a
// photographic dusk ground that breaks the run of paper sections.
//
// ── IT WAS A CAROUSEL UNTIL 2026-09-22 ───────────────────────────────────
// Nine cards on a horizontal rail with prev/next arrows, one card enlarged at
// a time. Three of the client's Versjon 6 notes land on this section and all
// three are answered by the same move:
//
//   "DELE I 2 SEKSJONER"
//   "Når du trykker send meg videre bort istedenfor en og en kort"
//   "Rydd opp i pilene"
//
// A rail earns its place at nine cards. At six it does not: six cards are a
// 3x2 grid, and the two rows ARE his two sections. Nothing is off-screen, so
// there is nothing to page through and no arrows to tidy — every card is a
// single click to the giving sheet, which is what "send meg videre" asks for.
//
// What went with the rail: railRef/root refs, the `active` index, the
// scroll-into-view effect, RailArrow, and the enlarged-current-card
// treatment. What stayed: this shell, the Amount counter, and the card
// itself — full-bleed photograph, gradient, amount in gold, title.
//
// Sized to a laptop. The rail version was trimmed hard for 13" screens
// (client, 2026-09-13: "too much scroll ... a lot to see shit fully, the cta
// at end"). A grid of six is shorter than a rail of nine was tall, so that
// constraint is satisfied by the shape rather than by squeezing.
const GRADE = 'saturate(0.82) contrast(1.06)';

// ── PHOTOGRAPHS ──────────────────────────────────────────────────────────
// The client's next line after the six levels is "Bilde: LEGG INN AI BILDER
// for «Hver sum bygger noe ekte»", and he is right that this section needed
// new pictures: the old nine were chosen for the old nine names, and after
// the rename four would have been plainly wrong — an Eid gathering under
// "Dør", the library under "Wudu-plass", youth at a table under
// "Bønneplass", the street iftar under "Skoleplass".
//
// Three arrived from the client 2026-09-23 as the architect's own renders,
// which is a better answer than generated art: they are the actual rooms
// being funded rather than a picture of a room like them. Sources were
// "4. Fasade detalj.jpg", "9. Skole klasserom.jpg" and "20. Wudu herrer.jpg"
// at 1856-2736px; each is resampled to 1100 wide and re-encoded at q80,
// which is where the rest of /photos/gift-* sit and comfortably covers the
// 352px the card renders at on a retina screen.
//
// The other three take the truest image already in the project. Replace them
// when his arrive — one line each, and the alt text in giftLadder.alt
// describes what is in frame, so it changes with them.
// ── RESOLUTION: THESE CARDS ARE PORTRAIT, THE RENDERS ARE NOT ────────────
// The card box is about 360x384 — taller than it is wide — and every source
// here is 16:9. object-cover scales a 16:9 frame to the box's HEIGHT and
// then crops the sides, so only ~55% of the file's width ever reaches the
// screen. A 1100px source therefore puts ~610px behind a 360px box: 1.7x,
// soft on any retina display. At 1600 it is ~880px, a true 2.4x.
//
// That is why they are encoded at 1600/q82 (~170-320KB) rather than the
// ~1100 the rest of /photos/gift-* sit at. The old files were sized for
// landscape slots; these are not landscape slots.
//
// THE ONE THAT WAS ACTUALLY BLURRY was gift-prayer-floor.webp, and neither
// re-encoding nor the card was the cause: that file is 347x325 PIXELS. It
// was being upscaled to fill the box before it ever reached a retina
// screen. It is replaced below rather than resized — there is nothing in it
// to recover.
const SHOTS: Record<GiftKey, string> = {
  // Client, 2026-09-23 ("Fugleperspektiv.jpg"). The block from above: a
  // founder funds the building, not a part of it, so this is the one level
  // whose subject is the project entire. Replaces project-aerial.webp,
  // which is the same view but at 2000x1250 of an older render.
  founder: '/photos/gift-founder.webp',
  // Client, 2026-09-23 — the girls' classroom, the render he chose.
  schoolPlace: '/photos/gift-classroom.webp',
  // zoom-prayer-hall at 1800x1011, NOT gift-prayer-floor at 347x325. The
  // old file was the blurry card: a thumbnail stretched to 360px wide and
  // then asked to serve a 2x screen. Same subject, eight times the pixels.
  prayerPlace: '/photos/zoom-prayer-hall.webp',
  // Client, 2026-09-23. Same room as zoom-wudu.webp but from his master
  // file rather than the compressed copy already in the project.
  //
  // WORTH KNOWING: /photos/svc-wudu.webp is NOT a wudu area despite the
  // name — it is the facade lattice shot from inside. It was on this card
  // for one build, sitting next to the Vindu tier showing the same lattice
  // from outside: two cards, one motif, neither of them wudu. The filename
  // is wrong at source; worth renaming when someone is in there.
  wudu: '/photos/gift-wudu.webp',
  // Client, 2026-09-23 — the facade detail, read from INSIDE the lattice:
  // each diamond a lit window with a room behind it. zoom-facade.webp shows
  // the same lattice from the street and was on this card for one build;
  // his version is the one that reads as a window rather than as a wall.
  window: '/photos/gift-window.webp',
  // Client, 2026-09-23 ("1. Hovedinngang.jpg") — the main entrance hall,
  // which is what is on the other side of the door. Replaces
  // proj-foyer.webp, an older render of the same space.
  door: '/photos/gift-door.webp',
};

function Amount({
  to,
  live,
  still,
  delay,
  locale,
}: {
  to: number;
  live: boolean;
  still: boolean;
  delay: number;
  locale: AppLocale;
}) {
  // Starts at the REAL figure, and only drops to zero from inside the first
  // animation frame. So if rAF never runs — a throttled tab, a dead observer,
  // hydration that failed — the price on screen is still the price. This is a
  // donation page: a counter that fails should cost the flourish, not show
  // "0 kr". The same reason components/reveal.tsx exists.
  const [shown, setShown] = useState(to);
  const ran = useRef(false);

  useEffect(() => {
    if (still || !live || ran.current) return;
    ran.current = true;
    let raf = 0;
    let start = 0;
    const run = (now: number) => {
      if (!start) {
        start = now;
        setShown(0);
      }
      const k = Math.min(1, (now - start - delay) / 900);
      if (k > 0) setShown(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [live, still, to, delay]);

  return <>{formatAmount(locale, shown)}</>;
}
export function GiftBuilds() {
  const t = useTranslations('giftLadder');
  const locale = useLocale() as AppLocale;
  const still = useReducedMotion() ?? false;
  const root = useRef<HTMLDivElement>(null);
  const live = useInView(root, { amount: 0.2 });

  return (
    <section
      id="hva-din-gave-bygger"
      aria-labelledby="gift-builds-heading"
      className="relative isolate overflow-hidden bg-dusk py-14 text-paper"
    >
      {/* The ground is a photograph, not a colour (client, 2026-09-13). It
         stays behind the section rather than scrolling with the page, and
         bg-dusk underneath is only the colour it falls back to while the
         file loads — not a panel the picture sits on. */}
      <Image
        src="/photos/gift-bg.webp"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        loading="eager"
        className="-z-10 select-none object-cover object-center"
        draggable={false}
      />
      {/* One wash, in the section's own dusk so it reads as shade rather than
         as a grey sheet. Strongest at the head and the foot, where type sits
         directly on it, and lightest across the middle, where the cards carry
         their own gradients. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(22,36,46,0.96) 0%, rgba(22,36,46,0.90) 20%, rgba(22,36,46,0.87) 52%, rgba(22,36,46,0.92) 84%, rgba(22,36,46,0.97) 100%)',
        }}
      />
      <SectionBody>
        {/* An eyebrow and a heading. No lede — the six cards under it are the
           proof of the claim, and a paragraph between them restated it. */}
        <div>
          <p className="flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
            <span aria-hidden className="h-px w-7 shrink-0 bg-gold/70" />
            {t('eyebrow')}
          </p>
          <h2
            id="gift-builds-heading"
            className="mt-5 max-w-[20ch] font-serif text-section text-balance text-paper"
          >
            {t.rich('heading', {
              em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
            })}
          </h2>
        </div>

        <div ref={root} className="mt-10 space-y-10 md:mt-12 md:space-y-12">
          {GIFT_SECTIONS.map((section, si) => (
            <div key={section}>
              {/* The section label is an eyebrow with a rule running off it,
                 not a second heading. Two <h2>-weight lines inside one
                 section would compete with the heading above; a mono label
                 divides without announcing itself. */}
              <h3 className="flex items-center gap-4 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-paper/55">
                <span className="shrink-0">{t(`sections.${section}`)}</span>
                <span aria-hidden className="h-px flex-1 bg-paper/15" />
              </h3>

              <ul className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {giftsIn(section).map((g, i) => (
                  <GiftCard
                    key={g.key}
                    gift={g}
                    locale={locale}
                    live={live}
                    still={still}
                    // Stagger runs across the whole section, not per row, so
                    // the six figures count up as one sweep.
                    delay={(si * 3 + i) * 90}
                    t={t}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-paper/45">
          {t('footnote')}
        </p>
      </SectionBody>
    </section>
  );
}

function GiftCard({
  gift: g,
  locale,
  live,
  still,
  delay,
  t,
}: {
  gift: Gift;
  locale: AppLocale;
  live: boolean;
  still: boolean;
  delay: number;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <li>
      <Reveal className="rv-ghost">
        <button
          type="button"
          onClick={() => openGiveSheet(g.amountNok)}
          aria-label={`${formatAmount(locale, g.amountNok)} kr · ${t(`items.${g.key}.title`)}`}
          // ONE HEIGHT FOR EVERY CARD. On the rail the current card grew to
          // 29rem and the rest sat at 25.5 — a way of showing position in a
          // thing you paged through. In a grid nothing has position, so a
          // taller card would only look like a mistake.
          className="group relative block h-[22rem] w-full overflow-hidden rounded-2xl text-start ring-1 ring-paper/10 transition-[box-shadow,transform] duration-500 ease-out hover:-translate-y-1 hover:ring-gold/70 sm:h-[24rem]"
        >
          <Image
            src={SHOTS[g.key]}
            alt={t(`alt.${g.key}`)}
            fill
            // ── sizes IS DOUBLED ON PURPOSE ───────────────────────────
            // The card is ~355x384 — PORTRAIT — and every source here is
            // 16:9. object-cover scales a landscape frame to the box's
            // HEIGHT, so what the browser actually needs is a file tall
            // enough for 384px, which on a 16:9 source means ~690px WIDE.
            //
            // sizes said 22rem (352px), so Next.js served the 352px variant:
            // 352x196 stretched into a 355x384 box — a 2x UPSCALE on the
            // vertical, before a retina screen doubled it again. Measured in
            // the browser; every card was soft and no amount of re-encoding
            // the sources could have fixed it, because the sources were
            // never the thing being delivered.
            //
            // Doubling each value states the real requirement: 44rem picks a
            // ~704px variant for a 352px box, which covers 384px of height
            // with room to spare, and the 2x entry in the srcset covers
            // retina on top of that.
            sizes="(min-width: 1024px) 44rem, (min-width: 640px) 90vw, 180vw"
            loading="eager"
            className="object-cover object-center transition-transform duration-[1.1s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
            style={{ filter: GRADE }}
          />

          {/* Lighter at the foot than a blanket would be (client, 2026-09-15:
             "maybe lighten the tint at bottom also so clearly shows the
             image"). It tops out at 0.80; the type gets its contrast from a
             shadow on the glyphs instead, which costs the photograph
             nothing. */}
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(22,36,46,0.04) 0%, rgba(22,36,46,0.08) 30%, rgba(22,36,46,0.36) 46%, rgba(22,36,46,0.64) 63%, rgba(22,36,46,0.78) 84%, rgba(22,36,46,0.82) 100%)',
            }}
          />

          <span
            className="absolute inset-x-0 bottom-0 block p-5"
            style={{ textShadow: '0 1px 2px rgba(22,36,46,0.95), 0 2px 12px rgba(22,36,46,0.8)' }}
          >
            <span className="block font-serif text-[clamp(1.6rem,2.4vw,2.1rem)] leading-none tabular-nums text-gold">
              <Amount to={g.amountNok} live={live} still={still} delay={delay} locale={locale} />{' '}
              <span className="text-[0.55em] text-paper/70">kr</span>
            </span>

            <span className="mt-3 block font-serif text-card text-paper">
              {t(`items.${g.key}.title`)}
            </span>

            {/* ── ONE LINE UNDER EVERY TITLE, AND THAT IS THE POINT ────────
               The client cut the sub-lines on 2026-09-18 — "are you stupid?
               some cards tetx removed someones didnt" — and the complaint was
               INCONSISTENCY: four of nine cards carried a line and five did
               not, which reads as a bug rather than as editing.

               All six carry one now, so the objection does not apply. And the
               new names need it in a way "En pult i skolen" never did: he
               specified what two of them come with — "stifter med eget
               signert dokument", "la en elev få mer i3lm på grunn av deg" —
               and a card reading only "Stifter" drops the thing he was
               actually offering. The lines are his words where he gave
               them. */}
            <span className="mt-2 block max-w-[30ch] text-[13.5px] leading-snug text-paper/75">
              {t(`notes.${g.key}`)}
            </span>

            <span className="mt-4 inline-flex min-h-10 items-center gap-2.5 rounded-full border border-gold/60 bg-gold/10 px-4 text-[14px] text-paper transition-colors duration-300 group-hover:bg-gold group-hover:text-dusk">
              {t('cta')}
              <span aria-hidden className="rtl:-scale-x-100">&rarr;</span>
            </span>
          </span>
        </button>
      </Reveal>
    </li>
  );
}
