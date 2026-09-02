import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { apartmentStats } from '@/lib/apartments';
import { Accent } from './accent';
import type { AppLocale } from '@/i18n/routing';

// The way across to the apartments, from the mosque-project page.
//
// It earns its place on that page rather than being an advert dropped into
// it: the flats are part of how the building is paid for, which is the same
// argument the rest of the page makes. So it is set as a plate — render
// behind, dusk over it, the two figures a buyer asks first — rather than as a
// button on paper.
//
// Every number is read, not typed: the count from CAMPAIGN, the sizes and the
// entry price from lib/apartments.ts, so this cannot drift out of step with
// the apartments page itself.

export async function ApartmentsCta({ locale }: { locale: AppLocale }) {
  const t = await getTranslations('apartmentsPage');
  const stats = apartmentStats();
  const fromMillions = new Intl.NumberFormat(
    locale === 'ar' ? 'ar-EG' : locale === 'en' ? 'en-GB' : 'nb-NO',
    { maximumFractionDigits: 1 },
  ).format(stats.fromNok / 1_000_000);

  return (
    <section className="bg-paper py-section-md">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-dusk text-paper">
          <Image
            src="/photos/zoom-garden.webp"
            alt=""
            fill
            sizes="(min-width: 768px) 72rem, 100vw"
            className="object-cover object-[50%_40%]"
          />
          {/* Reading-side scrim. Two utilities rather than one: a gradient
             angle is physical, so in Arabic the dark end has to move with the
             words. */}
          <div aria-hidden className="absolute inset-0 bg-dusk/55" />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-dusk via-dusk/75 to-dusk/20 rtl:bg-gradient-to-l"
          />

          <div className="relative grid gap-10 p-8 sm:p-12 md:grid-cols-[1.25fr_1fr] md:items-end md:gap-16 md:p-14">
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
                {t('cta.eyebrow')}
              </p>
              <h2 className="mt-5 max-w-[16ch] font-serif text-[clamp(1.9rem,4vw,3rem)] leading-[1.05] text-balance text-paper">
                {t.rich('cta.heading', { em: (chunks) => <Accent surface="dusk">{chunks}</Accent> })}
              </h2>
              <p className="mt-5 max-w-[46ch] text-body text-paper/75">{t('cta.body')}</p>

              <Link
                href={`/${locale}/moskeprosjektet/leiligheter`}
                className="group mt-9 inline-flex min-h-12 items-center gap-3 rounded-full bg-gold-deep px-7 text-[15px] font-semibold text-paper transition-colors hover:bg-paper hover:text-ink"
              >
                {t('cta.cta')}
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            </div>

            {/* The three figures a buyer asks first, on one rule. */}
            <dl className="grid grid-cols-3 gap-x-6 border-t border-paper/25 pt-6 md:pt-8">
              <div>
                <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-paper/55">
                  {t('cta.countLabel')}
                </dt>
                <dd className="mt-2.5 font-serif text-[clamp(1.5rem,2.6vw,2rem)] leading-none tabular-nums text-paper">
                  {CAMPAIGN.rentalApartments}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-paper/55">
                  {t('cta.sizeLabel')}
                </dt>
                <dd className="mt-2.5 font-serif text-[clamp(1.5rem,2.6vw,2rem)] leading-none tabular-nums text-paper">
                  {stats.minM2}&ndash;{stats.maxM2}
                  <span className="ms-1 font-mono text-[0.6875rem] text-paper/55">m&sup2;</span>
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-paper/55">
                  {t('priceLabel')}
                </dt>
                <dd className="mt-2.5 font-serif text-[clamp(1.5rem,2.6vw,2rem)] leading-none tabular-nums text-gold">
                  {fromMillions}
                  <span className="ms-1.5 font-serif text-[0.8125rem] italic text-paper/55">
                    {t('priceUnit')}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
