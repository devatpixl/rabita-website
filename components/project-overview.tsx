import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Accent } from './accent';
import type { AppLocale } from '@/i18n/routing';

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
    { value: nf.format(CAMPAIGN.buildingM2), unit: 'm²', label: t('figures.area') },
    { value: `${CAMPAIGN.floorsAbove}+${CAMPAIGN.floorsBelow}`, label: t('figures.floors') },
    {
      value: nf.format(CAMPAIGN.mensPrayerCapacityAfter + CAMPAIGN.womensPrayerCapacityAfter),
      label: t('figures.places'),
    },
    { value: String(CAMPAIGN.siteClearedRamadan), label: t('figures.cleared') },
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
        <div
          aria-hidden
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              'linear-gradient(90deg, rgba(22,36,46,0.96) 0%, rgba(22,36,46,0.88) 30%, rgba(22,36,46,0.45) 55%, rgba(22,36,46,0.12) 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2 hidden md:block"
          style={{
            background: 'linear-gradient(180deg, rgba(22,36,46,0) 0%, rgba(22,36,46,0.92) 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-24 md:hidden"
          style={{ background: 'linear-gradient(180deg, rgba(22,36,46,0) 0%, rgba(22,36,46,1) 100%)' }}
        />
      </div>

      <div className="relative mx-auto flex min-h-0 max-w-6xl flex-col px-6 pb-10 pt-10 md:min-h-[min(88svh,52rem)] md:justify-between md:pb-12 md:pt-24">
        {/* Words, on the reading side. */}
        <div className="max-w-xl">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
            {tp('pages.building.eyebrow')} · {CAMPAIGN.address}
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

        {/* The ledger: four equal columns, dividers between them only, held
           to the same measure as the headline column so it reads as part of
           the same block. Labels are one line each, so all four baselines
           align. */}
        <dl className="mt-14 grid max-w-xl grid-cols-2 border-t border-paper/20 sm:grid-cols-4 md:mt-16">
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
      </div>

      {/* Architect credit, out of the ledger: bottom-right of the plate, set
         like a caption. */}
      <p className="absolute bottom-5 end-6 hidden text-end font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-paper/45 md:block lg:end-12">
        {t('credit')}
        <br />
        {CAMPAIGN.architect.split(',')[0]}
        <br />
        {CAMPAIGN.architect.split(',').slice(1).join(',').trim()}
      </p>
    </section>
  );
}
