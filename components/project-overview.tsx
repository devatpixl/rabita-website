import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { CAMPAIGN, PROJECT_PHASES } from '@/lib/campaign';
import { Accent } from './accent';
import type { AppLocale } from '@/i18n/routing';
import { FigureIcon } from './figure-icons';

// The building, introduced on the homepage — as a plate, not a slide.
//
// The earlier version set prose on the left and the render in a rounded
// box on the right, with three figures squeezed under the paragraph. That
// is the shape of a pitch deck. Rebuilt 2026-08-30 the way an architecture
// monograph sets a project: the render runs edge to edge and carries the
// section; the words sit over a dusk scrim on the reading side; the figures
// run as one ruled ledger along the foot, each with its own cell; the
// architect is credited in the ledger like a plate caption. No motion.
//
// Hands off to /moskeprosjektet, which holds the pinned build sequence and
// the costed gifts.

export async function ProjectOverview() {
  const locale = (await getLocale()) as AppLocale;
  const tp = await getTranslations('projectPages');
  const t = await getTranslations('projectOverview');
  const nf = new Intl.NumberFormat('nb-NO');

  // How big, how tall, who it is for, and when. All four in the same
  // off-white: the one gold accent in this section is "one" in the headline.
  const figures = [
    { icon: 'building' as const, value: nf.format(CAMPAIGN.buildingM2), unit: 'm²', label: t('figures.area') },
    { icon: 'floors' as const, value: `${CAMPAIGN.floorsAbove}+${CAMPAIGN.floorsBelow}`, label: t('figures.floors') },
    {
      icon: 'people' as const,
      value: nf.format(CAMPAIGN.mensPrayerCapacityAfter + CAMPAIGN.womensPrayerCapacityAfter),
      label: t('figures.places'),
    },
    { icon: 'calendar' as const, value: String(PROJECT_PHASES[PROJECT_PHASES.length - 1].to), label: t('figures.done') },
  ];

  return (
    <section
      aria-labelledby="project-overview-heading"
      className="relative isolate overflow-hidden bg-dusk text-paper"
    >
      {/* The plate. On desktop it is the whole band; on a phone it is a
         4:3 crop above the words, because a scrim over a portrait crop
         would hide the roof garden that makes the render legible. */}
      <div className="relative aspect-[4/3] md:absolute md:inset-0 md:aspect-auto">
        <Image
          src="/photos/project-aerial.webp"
          alt={tp('aerial')}
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: '62% 40%', filter: 'saturate(0.8) contrast(1.08) brightness(0.92)' }}
        />
        {/* Reading-side scrim on desktop; a foot fade on the phone so the
           crop meets the dusk block underneath without a hard edge. */}
        {/* Reading-side scrim. rtl:-scale-x-100 because a CSS gradient angle is
           physical, not logical: at 90deg the dark end is always on the left,
           so in Arabic — where the words sit on the right — the headline was
           set over the sunlit half of the render and was close to unreadable.
           Flipping the element flips the gradient with it. */}
        <div
          aria-hidden
          className="absolute inset-0 hidden md:block rtl:-scale-x-100"
          style={{
            background:
              'linear-gradient(90deg, rgba(22,36,46,0.96) 0%, rgba(22,36,46,0.88) 30%, rgba(22,36,46,0.45) 55%, rgba(22,36,46,0.12) 100%)',
          }}
        />
        {/* Foot scrim. Deepened on 2026-08-31 when the ledger went full width:
           tuned for a half-width ledger it only ever had to darken the left of
           the frame, and the two right-hand figures ended up set over sunlit
           facade. It now carries real weight by the midpoint. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 hidden h-[62%] md:block"
          style={{
            background:
              'linear-gradient(180deg, rgba(22,36,46,0) 0%, rgba(22,36,46,0.5) 42%, rgba(22,36,46,0.86) 72%, rgba(22,36,46,0.97) 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-24 md:hidden"
          style={{ background: 'linear-gradient(180deg, rgba(22,36,46,0) 0%, rgba(22,36,46,1) 100%)' }}
        />
      </div>

      <div className="relative mx-auto flex min-h-0 max-w-6xl flex-col px-6 pb-10 pt-10 md:min-h-[min(88svh,52rem)] md:justify-between md:pb-24 md:pt-24">
        {/* Words, on the reading side. */}
        <div className="max-w-xl">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
            {CAMPAIGN.address}
          </p>
          <h2
            id="project-overview-heading"
            className="mt-5 font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] text-balance text-paper"
          >
            {tp.rich('pages.building.title', {
              em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
            })}
          </h2>
          <p className="mt-6 max-w-[44ch] text-body text-paper/80">{t('briefShort')}</p>
          <Link
            href={`/${locale}/moskeprosjektet`}
            className="group mt-8 inline-flex min-h-11 items-center gap-3 text-[15px] font-semibold text-paper transition-colors hover:text-gold"
          >
            <span className="border-b border-gold pb-0.5">{t('cta')}</span>
            <span
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
            >
              &rarr;
            </span>
          </Link>
        </div>

        {/* ── the ledger, phone ──────────────────────────────────────────
           Untouched (client, 2026-08-31: "dont change on phone"). Four
           figures in two columns with plain rules, held to the headline's
           measure. The cartouche below replaces it from md up. */}
        <dl className="mt-14 grid max-w-xl grid-cols-2 border-t border-paper/20 sm:grid-cols-4 md:mt-16 md:hidden">
          {figures.map((f, i) => (
            <div
              key={f.label}
              className={[
                'py-5 pe-4 lg:py-6',
                i % 2 === 1 ? 'border-s border-paper/15 ps-4' : '',
                i >= 2 ? 'border-t border-paper/15 sm:border-t-0' : '',
                i === 2 ? 'sm:border-s sm:ps-4' : '',
              ].join(' ')}
            >
              <dd className="flex items-baseline gap-1.5 font-serif text-[clamp(1.75rem,3vw,2.5rem)] leading-none tabular-nums text-paper">
                <span>{f.value}</span>
                {f.unit && (
                  <span className="font-mono text-[11px] tracking-[0.08em] text-paper/55">{f.unit}</span>
                )}
              </dd>
              <dt className="mt-2.5 whitespace-nowrap font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper/55">
                {f.label}
              </dt>
            </div>
          ))}
        </dl>

        {/* ── the ledger, desktop ────────────────────────────────────────
           The same four figures, set as a cartouche (client reference,
           2026-08-31): an icon in a diamond beside each figure, a short gold
           rule under each label, and a hexagonal frame drawn around the whole
           row with a diamond at the foot.

           It runs the full measure rather than the headline's, because the
           frame is what makes it read as a plate caption rather than as four
           more paragraphs — and a plate caption spans its plate.

           The frame is four pieces, not one stretched SVG: the two side caps
           are drawn with non-scaling strokes so the diagonals keep their
           weight at any width, and the rails between them are plain rules. A
           single SVG on preserveAspectRatio="none" would have thinned the
           horizontals and fattened the diagonals as the viewport changed. */}
        <div className="relative mt-16 hidden md:block">
          {/* side caps */}
          <svg
            aria-hidden
            viewBox="0 0 44 100"
            preserveAspectRatio="none"
            className="absolute inset-y-0 start-0 w-11 text-gold/40 rtl:-scale-x-100"
          >
            <path
              d="M44 0.5 L0.5 50 L44 99.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <svg
            aria-hidden
            viewBox="0 0 44 100"
            preserveAspectRatio="none"
            className="absolute inset-y-0 end-0 w-11 -scale-x-100 text-gold/40 rtl:scale-x-100"
          >
            <path
              d="M44 0.5 L0.5 50 L44 99.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {/* rails */}
          <span aria-hidden className="absolute inset-x-11 top-0 h-px bg-gold/40" />
          <span aria-hidden className="absolute inset-x-11 bottom-0 h-px bg-gold/40" />
          {/* the diamond at the foot, sitting on the rail */}
          <span
            aria-hidden
            className="absolute bottom-0 start-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rotate-45 border border-gold/60 bg-dusk rtl:translate-x-1/2"
          />

          <dl className="grid grid-cols-4 px-14 py-9">
            {figures.map((f, i) => (
              <div
                key={f.label}
                className={['flex items-center gap-4 px-5', i > 0 ? 'border-s border-paper/12' : ''].join(' ')}
              >
                {/* icon in its diamond: the frame is a rotated square, the
                   icon is not, so it stays upright inside it */}
                <span className="relative grid h-11 w-11 shrink-0 place-items-center">
                  <span aria-hidden className="absolute inset-1 rotate-45 border border-gold/45" />
                  <FigureIcon name={f.icon} className="relative h-[18px] w-[18px] text-gold/85" />
                </span>
                <div className="min-w-0">
                  <dd className="flex items-baseline gap-1.5 font-serif text-[clamp(1.6rem,2.6vw,2.35rem)] leading-none tabular-nums text-paper">
                    <span>{f.value}</span>
                    {f.unit && (
                      <span className="font-mono text-[11px] tracking-[0.08em] text-paper/55">{f.unit}</span>
                    )}
                  </dd>
                  <dt className="mt-2.5 whitespace-nowrap font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper/55">
                    {f.label}
                  </dt>
                  <span aria-hidden className="mt-2.5 block h-px w-7 bg-gold/70" />
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Architect credit, out of the ledger: bottom-right of the plate, set
         like a caption. */}
      <p className="absolute bottom-4 end-6 hidden text-end font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-paper/45 md:block lg:end-12">
        {t('credit')}
        <br />
        {CAMPAIGN.architect.split(',')[0]}
        <br />
        {CAMPAIGN.architect.split(',').slice(1).join(',').trim()}
      </p>
    </section>
  );
}
