import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { SectionBody } from './primitives';
import { Accent } from './accent';
import type { AppLocale } from '@/i18n/routing';

// The building, introduced on the homepage.
//
// Without this the page asked for money for something it never named: the
// campaign meter said "raised for the new mosque" and the next section was
// where the money goes, with nothing in between saying what the mosque IS.
// The zoom parallax shows it at the top, wordlessly, and that was the only
// trace of it.
//
// Deliberately an introduction, not a second project page. It states what
// the building is, gives three figures, and hands off to
// /moskeprosjektet, which holds the pinned build sequence and the costed
// gifts. Every word here already existed in projectPages.pages.building —
// nothing new to translate.
//
// On dusk on purpose. When the gift cards moved to the project page the
// homepage lost its only dark band and ran cream from the hero to the
// footer; this puts the break back where the page needs a change of pace.

const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

export async function ProjectOverview() {
  const locale = (await getLocale()) as AppLocale;
  const tp = await getTranslations('projectPages');
  const t = await getTranslations('projectOverview');
  const nf = new Intl.NumberFormat('nb-NO');

  // Three figures, chosen because each answers a different question: how
  // big, how tall, and who it is actually for. The capacity is the one that
  // carries feeling — it is the only figure here about people.
  const figures = [
    { value: `${nf.format(CAMPAIGN.buildingM2)} m²`, label: t('figures.area') },
    {
      value: `${CAMPAIGN.floorsAbove}+${CAMPAIGN.floorsBelow}`,
      label: t('figures.floors'),
    },
    {
      value: `${nf.format(CAMPAIGN.mensPrayerCapacityAfter + CAMPAIGN.womensPrayerCapacityAfter)}`,
      label: t('figures.places'),
    },
  ];

  return (
    <section
      aria-labelledby="project-overview-heading"
      className="bg-dusk py-section-lg text-paper"
    >
      <SectionBody>
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
          {/* Text column. Narrower than the image so the render carries the
             section and the words stay a column of prose. */}
          <div className="md:col-span-5">
            <h2
              id="project-overview-heading"
              className="font-serif text-section text-balance text-paper"
            >
              {tp.rich('pages.building.title', {
                em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
              })}
            </h2>

            <p className="mt-6 max-w-prose text-body text-paper/75">
              {tp('pages.building.brief')}
            </p>

            {/* Figures at display size with mono labels under them — the
               pairing the campaign meter uses, so the two dark and light
               halves of the page read as one system. */}
            <dl className="mt-10 grid grid-cols-3 gap-x-6 border-t border-paper/15 pt-7">
              {figures.map((f) => (
                <div key={f.label}>
                  <dd className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] leading-none tabular-nums text-paper">
                    {f.value}
                  </dd>
                  <dt className="mt-2 font-mono text-[0.625rem] uppercase leading-snug tracking-[0.14em] text-paper/50">
                    {f.label}
                  </dt>
                </div>
              ))}
            </dl>

            {/* A link, not a filled button. Give already owns the one filled
               action on this page; a second would be the competing CTA the
               brief warns about. */}
            <Link
              href={`/${locale}/moskeprosjektet`}
              className="group mt-10 inline-flex min-h-11 items-center gap-3 text-[15px] font-semibold text-paper underline decoration-gold underline-offset-[6px] transition-colors hover:text-gold"
            >
              {t('cta')}
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              >
                &rarr;
              </span>
            </Link>
          </div>

          <div className="md:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-dusk md:aspect-[3/2]">
              <Image
                src="/photos/project-aerial.webp"
                alt={tp('aerial')}
                fill
                sizes="(min-width: 768px) 58vw, 92vw"
                className="object-cover"
                style={{ filter: GRADE }}
              />
            </div>
            <p className="mt-4 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-paper/45">
              {CAMPAIGN.architect}
            </p>
          </div>
        </div>
      </SectionBody>
    </section>
  );
}
