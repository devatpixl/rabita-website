import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { LANDMARKS, routedMinutes } from '@/lib/location';
import { Accent } from '@/components/accent';
import { ProjectGallery } from '@/components/project-gallery';
import { ProjectHero } from '@/components/project-page';
import { RequestForm } from '@/components/request-form';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';

// The fifteen apartments in the new building, for sale. Everything here is
// what the project has actually published: the count, the address, that
// they sit on the upper floors beside the roof garden, that the sale helps
// finance the building (Årsrapport 2025), and the routed walking times to
// the stations. Prices, plans and the sales start are NOT invented — the
// page collects interest until they exist.

export default async function ApartmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'apartmentsPage' });
  const tp = await getTranslations({ locale, namespace: 'projectPages' });

  const label = 'font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink-60';
  const row = 'flex min-h-[3.75rem] items-baseline justify-between gap-4 py-3 md:min-h-[4.5rem]';
  const walk = LANDMARKS.map((l) => ({ key: l.key, min: routedMinutes(l.key) })).sort((a, b) => a.min - b.min);

  const facts: { key: string; value: string; muted?: boolean }[] = [
    { key: 'count', value: String(CAMPAIGN.rentalApartments) },
    { key: 'address', value: CAMPAIGN.address },
    { key: 'floors', value: t('facts.floorsValue') },
    { key: 'completion', value: t('facts.completionValue'), muted: true },
    { key: 'architect', value: CAMPAIGN.architect.split(',')[0] },
  ];

  return (
    <main>
      <ProjectHero
        crumb={tp('crumb')}
        eyebrow={t('eyebrow')}
        title={t.rich('title', { em: (chunks) => <Accent surface="dusk">{chunks}</Accent> })}
        lede={t('lede')}
        ledeShort={t('ledeShort')}
        image="/photos/project-aerial.webp"
        alt={t('eyebrow')}
        primary={{ label: t('primary'), href: `/${locale}/moskeprosjektet/leiligheter#interesse` }}
        secondary={{ label: t('secondary'), href: `/${locale}/moskeprosjektet` }}
      />

      {/* The renders that matter for a buyer: the roof, the garden, the street. */}
      <section className="bg-paper-2 py-section-md">
        <SectionBody>
          <ProjectGallery only={['aerial', 'garden', 'facadeDay', 'facadeNight']} />
        </SectionBody>
      </section>

      <Section tone="paper">
        <SectionBody>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">{t('why.eyebrow')}</p>
          <SectionHeading className="mt-4 max-w-2xl">
            {t.rich('why.heading', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
          </SectionHeading>
          <div className="mt-12 grid gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
            {/* Facts register, same design as the project page. */}
            <div>
              <h2 className={label}>{t('facts.heading')}</h2>
              <dl className="mt-3 divide-y-[0.5px] divide-rule border-t border-ink">
                {facts.map((f) => (
                  <div key={f.key} className={row}>
                    <dt className="text-[13px] text-ink-60">{t(`facts.${f.key}`)}</dt>
                    <dd className="text-end">
                      {f.muted ? (
                        <span className="text-[13px] italic text-ink-60">{f.value}</span>
                      ) : (
                        <span className="font-serif text-[1.35rem] leading-none tabular-nums text-ink md:text-[1.5rem]">{f.value}</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              <h2 className={`${label} mt-10`}>{t('facts.walking')}</h2>
              <dl className="mt-3 divide-y-[0.5px] divide-rule border-t border-ink">
                {walk.map((w) => (
                  <div key={w.key} className={row}>
                    <dt className="text-[13px] text-ink-60">{t(`facts.stations.${w.key}`)}</dt>
                    <dd className="flex items-baseline gap-1.5">
                      <span className="font-serif text-[1.35rem] leading-none tabular-nums text-ink md:text-[1.5rem]">{w.min}</span>
                      <span className="font-mono text-[11px] tracking-[0.08em] text-ink-60">min</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Three reasons. Sticky from md, so they keep company with the
               registers as the reader scrolls the longer left column. Each
               title carries one word in the gold italic accent; a thin gold
               rule grows down the start edge on hover. */}
            <ul className="border-t border-ink md:sticky md:top-28 md:self-start">
              {(['garden', 'city', 'building'] as const).map((k) => (
                <li key={k} className="group relative border-b-[0.5px] border-rule py-6 ps-5 transition-colors duration-300 hover:bg-paper-2/60">
                  <span
                    aria-hidden
                    className="absolute inset-y-0 start-0 w-px origin-top scale-y-0 bg-gold-deep transition-transform duration-300 ease-out group-hover:scale-y-100 motion-reduce:transition-none"
                  />
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold-deep">{t(`why.items.${k}.tag`)}</p>
                  <h3 className="mt-2 font-serif text-[1.35rem] leading-tight text-ink">
                    {t.rich(`why.items.${k}.title`, { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
                  </h3>
                  <p className="mt-2 max-w-prose text-body text-ink-60">{t(`why.items.${k}.body`)}</p>
                </li>
              ))}
            </ul>
          </div>
        </SectionBody>
      </Section>

      {/* Interest. Honest about what is and is not decided yet. */}
      <Section tone="paper-2" id="interesse">
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">{t('interest.eyebrow')}</p>
              <SectionHeading className="mt-4">
                {t.rich('interest.heading', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
              </SectionHeading>
              <p className="mt-4 max-w-prose text-body text-ink-60">{t('interest.body')}</p>
              <p className="mt-6 border-s-2 border-gold-deep ps-4 text-[14px] leading-relaxed text-ink">{t('interest.note')}</p>
            </div>
            <div className="md:col-span-7">
              <RequestForm subject="apartments" heading={t('interest.formHeading')} card />
            </div>
          </div>
        </SectionBody>
      </Section>
    </main>
  );
}
