import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { PrayerToday } from './prayer-today';
import { Eyebrow, Section, SectionBody, SectionHeading } from './primitives';

// Prayer times, address, opening hours and group booking, as one column of
// running copy with a single tall photograph beside it.
//
// The previous layout put the times on the left and everything else on the
// right, which left the left column dead from the Friday row down and the
// right column short of the section floor. Both readings are now one column,
// and the photograph is sticky, so the two sides finish level at every height.
export async function PrayerVisit() {
  const t = await getTranslations('prayerVisit');
  const locale = await getLocale();

  return (
    <Section id="bonn-og-besok" tone="paper-2">
      <SectionBody>
        <div className="mb-8 md:mb-10">
          {/* Eyebrow and the open sign share one dateline, so the sign reads as
             part of the section head instead of floating beside the headline. */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <Eyebrow>{t('eyebrow')}</Eyebrow>
            <p className="flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-gold-deep">
              <span className="pulse-dot" aria-hidden />
              {t('seal')}
            </p>
          </div>
          <SectionHeading className="mt-3 max-w-2xl">{t('heading')}</SectionHeading>
        </div>

        <div className="grid gap-10 md:grid-cols-12 md:gap-x-12">
          <div className="md:col-span-7">
            <div id="bonnetider">
              <h3 className="mb-4 font-serif text-card text-ink">{t('todayHeading')}</h3>
              <PrayerToday />
              <Link
                href={`/${locale}/bonnetider`}
                className="mt-4 inline-flex min-h-11 items-center text-body font-semibold text-ink underline underline-offset-4 hover:decoration-2"
              >
                {t('fullWeek')}
              </Link>
            </div>

            <div className="mt-6 border-t border-rule pt-8">
              <h3 className="font-serif text-card text-ink">{t('visitHeading')}</h3>

              {/* Address and hours as a two-line ledger, so the street and the
                 opening times read as data rather than as more paragraphs. */}
              <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-60">
                    {t('addressLabel')}
                  </dt>
                  <dd className="mt-2 font-serif text-card text-ink">{CAMPAIGN.address}</dd>
                  <dd className="text-body text-ink-60">{CAMPAIGN.postalCity}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-60">
                    {t('hoursLabel')}
                  </dt>
                  <dd className="mt-2 font-serif text-card tabular-nums text-ink">
                    {CAMPAIGN.openingHours}
                  </dd>
                </div>
              </dl>

              <p className="mt-6 max-w-prose text-body text-ink">{t('groupsBody')}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/besok-oss`}
                  className="inline-flex min-h-11 items-center rounded-btn bg-gold-deep px-4 py-2 text-[15px] font-semibold text-paper transition-colors hover:bg-ink"
                >
                  {t('bookGroup')}
                </Link>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(CAMPAIGN.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center rounded-btn border border-ink px-4 py-2 text-body font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  {t('directions')}
                </a>
              </div>
            </div>
          </div>

          {/* One tall photograph, sticky, so it stays beside whichever part of
             the column the reader is on. */}
          <div className="md:col-span-5">
            <figure className="md:sticky md:top-28">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-paper">
                <Image
                  src="/photos/community/visit-door.webp"
                  alt={t('photoAlt')}
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 40vw, 90vw"
                  className="editorial-photo object-cover"
                />
              </div>
              <figcaption className="mt-3 max-w-[42ch] text-[13px] leading-relaxed text-ink-60">
                {t('photoCaption')}
              </figcaption>
            </figure>
          </div>
        </div>
      </SectionBody>
    </Section>
  );
}
