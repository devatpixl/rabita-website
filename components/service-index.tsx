'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { SERVICE_FOCUS, SERVICE_GROUPS, SERVICE_IMAGE, type ServiceKey } from '@/lib/services';
import { Section, SectionBody } from './primitives';
import { Accent } from './accent';
import { Reveal } from './reveal';
import { cn } from '@/lib/cn';

// Every service Rabita offers, as a scrolled sequence rather than a grid.
// Rebuilt 2026-08-31 to the reference the client gave (innocents.no/programmer
// and /programmer/foreldrelose-barn):
//
//   • one service per band, image and words trading sides as you go down, so
//     the eye is thrown left-right-left and the page has a pulse instead of a
//     wall of equal boxes;
//   • an oversized serif numeral hung off the outer top corner of each photo,
//     half on the picture and half on the page;
//   • a thin outlined "ghost" card offset behind the photo — the one piece of
//     decoration, and it does real work: it gives a flat photograph depth
//     without a drop shadow;
//   • mono eyebrow, large serif title, body, mono link. That is the type
//     hierarchy from the reference, in Rabita's own faces and gold.
//
// The grid version this replaced is described in the git history: its problem
// was that groups of 4/2/3/2 could not fill a fixed four-column grid, so the
// page had holes. Here group is a label rather than a container, so counts
// stop mattering entirely.
//
// Reveal is the fail-safe one (see reveal.tsx), NOT framer's whileInView: that
// ships opacity:0 in the HTML and left this page blank when the observer
// missed. Content is visible in the markup; the animation only ever adds.

// Flattened in group order: the grouping no longer prints, but it still
// decides the sequence, so related services stay next to each other.
const ITEMS = SERVICE_GROUPS.flatMap((g) => g.items.map((key) => ({ key: key as ServiceKey })));

export function ServiceIndex() {
  const locale = useLocale();
  const t = useTranslations('servicesIndex');
  const total = String(ITEMS.length).padStart(2, '0');

  return (
    <Section tone="paper">
      <SectionBody>
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
          {t('allEyebrow')}
        </p>
        <h2 className="mt-4 max-w-2xl font-serif text-section text-balance text-ink">
          {t.rich('allHeading', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
        </h2>

        <ol className="mt-12 space-y-16 md:mt-20 md:space-y-32">
          {ITEMS.map(({ key }, i) => {
            const n = String(i + 1).padStart(2, '0');
            // Sides trade every other band. Below md everything stacks with the
            // picture first, so the alternation never turns into a text block
            // stranded above its own photograph.
            const flipped = i % 2 === 1;
            // Every band uses the SAME frame. An earlier version gave the one
            // portrait source a taller box so it would not crop — but a single
            // band standing taller than the other nine reads as a bug, not as
            // art direction. Uniform frame, and the crop is steered instead
            // (SERVICE_FOCUS).
            return (
              <Reveal as="li" key={key} delay={0}>
                <div className="grid items-center gap-8 md:grid-cols-2 md:gap-16 lg:gap-24">
                  {/* ── picture ─────────────────────────────────────── */}
                  <div className={cn('relative', flipped ? 'md:order-2' : 'md:order-1')}>
                    {/* Ghost card, offset outward. Sits behind the photo and
                       leans away from the words, so it reads as depth rather
                       than as a misaligned border. */}
                    <span
                      aria-hidden
                      className={cn(
                        'rv-ghost pointer-events-none absolute inset-0 rounded-2xl border border-gold-deep/25',
                        flipped
                          ? '-translate-x-2 translate-y-2 md:-translate-x-4 md:translate-y-4'
                          : 'translate-x-2 translate-y-2 md:translate-x-4 md:translate-y-4',
                      )}
                    />
                    {/* The picture links too, so clicking it does the obvious
                       thing. aria-hidden + tabIndex -1 because the titled link
                       below already announces this destination — a second one
                       would just be read out twice. */}
                    <Link
                      href={`/${locale}/tjenester/${key}`}
                      aria-hidden
                      tabIndex={-1}
                      className="rv-img group/pic relative block aspect-[5/4] overflow-hidden rounded-2xl bg-paper-2 md:aspect-[4/3]"
                    >
                      <Image
                        src={SERVICE_IMAGE[key]}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 42vw, 92vw"
                        style={{ objectPosition: SERVICE_FOCUS[key] ?? '50% 50%' }}
                        className="rv-zoom object-cover group-hover/pic:scale-[1.03] motion-reduce:transition-none"
                      />
                      {/* The curtain: a panel the colour of the page that
                         retracts downward off the picture. See globals.css. */}
                      <span aria-hidden className="rv-mask absolute inset-0 z-[2] bg-paper" />
                    </Link>

                    {/* The numeral, hung off the outer top corner: half over the
                       picture, half over the page. */}
                    <span
                      aria-hidden
                      className={cn(
                        'rv-num pointer-events-none absolute -top-9 select-none font-serif leading-none text-ink/35 md:-top-10',
                        'text-[clamp(2.6rem,11vw,7.5rem)]',
                        flipped ? 'end-0 md:-end-4' : 'start-0 md:-start-4',
                      )}
                    >
                      {n}
                    </span>
                  </div>

                  {/* ── words ───────────────────────────────────────── */}
                  <div className={cn(flipped ? 'md:order-1' : 'md:order-2')}>
                    {/* Counter then rule, as the reference has it. The group
                       name that used to lead this line came out on 2026-08-31:
                       it was the smallest type on the page and repeated four
                       times in a row, so it read as noise rather than as a
                       label. The grouping still lives in lib/services.ts and
                       still sets the order. */}
                    <div className="rv-up flex items-center gap-4">
                      <span className="font-mono text-[0.75rem] tabular-nums tracking-[0.14em] text-gold-deep">
                        {n} <span className="text-ink-60/50">/</span> {total}
                      </span>
                      <span aria-hidden className="h-px w-12 bg-gold-deep/45" />
                    </div>

                    <h3 style={{ transitionDelay: '0.09s' }} className="rv-up mt-5 font-serif leading-[1.06] text-balance text-ink text-[clamp(1.9rem,4vw,3.1rem)]">
                      {t.rich(`items.${key}.title`, {
                        em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
                      })}
                    </h3>

                    <p style={{ transitionDelay: '0.16s' }} className="rv-up mt-5 max-w-[44ch] text-body text-ink-60">
                      {t(`items.${key}.body`)}
                    </p>

                    <Link
                      href={`/${locale}/tjenester/${key}`}
                      style={{ transitionDelay: '0.23s' }}
                      className="rv-up group/link mt-7 inline-flex items-center gap-2 border-b border-gold-deep/40 pb-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold-deep hover:border-gold-deep"
                    >
                      {t('more')}
                      <span
                        aria-hidden
                        className="transition-transform duration-200 group-hover/link:translate-x-1 rtl:rotate-180 rtl:group-hover/link:-translate-x-1"
                      >
                        &rarr;
                      </span>
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </SectionBody>
    </Section>
  );
}
