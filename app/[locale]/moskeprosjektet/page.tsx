import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';

import { Accent } from '@/components/accent';
import {
  ProjectAssurance,
  ProjectBrief,
  ProjectColumns,
  ProjectHero,
} from '@/components/project-page';
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'projectPage' });
  const tp = await getTranslations({ locale, namespace: 'projectPages' });
  const l = await getLocale();

  return (
    <main>
      <ProjectHero
        crumb={tp('crumb')}
        eyebrow={tp('pages.building.eyebrow')}
        title={tp.rich('pages.building.title', {
          em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
        })}
        lede={tp('pages.building.lede')}
        image="/photos/hero-project.webp"
        alt={tp('pages.building.eyebrow')}
        primary={{ label: tp('pages.building.primary'), give: true }}
        secondary={{ label: tp('pages.building.secondary'), href: `/${locale}/hvor-pengene-gar` }}
      />
      <ProjectBrief label={tp('pages.building.briefLabel')} body={tp('pages.building.brief')} />
      <ProjectColumns
        eyebrow={tp('pages.building.colEyebrow')}
        heading={tp('pages.building.colHeading')}
        items={tp.raw('pages.building.items') as { title: string; body: string }[]}
      />
      <section className="bg-paper-2 pb-section-md">
        <SectionBody>
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-paper">
            <Image
              src="/photos/project-aerial.webp"
              alt={tp('aerial')}
              fill
              sizes="(min-width: 1024px) 78vw, 92vw"
              className="object-cover"
              style={{ filter: 'saturate(0.72) contrast(1.12) brightness(0.9)' }}
            />
          </div>
          <p className="mt-4 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-60">{tp('aerial')}</p>
        </SectionBody>
      </section>
      <Section tone="paper">
        <SectionBody>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="mb-4 font-serif text-card text-ink">{t('facts.heading')}</h2>
              <dl className="divide-y divide-rule border-y border-rule">
                {[
                  ['building', `${CAMPAIGN.buildingM2.toLocaleString('nb-NO')} m²`],
                  ['floors', `${CAMPAIGN.floorsAbove}+${CAMPAIGN.floorsBelow}`],
                  ['architect', CAMPAIGN.architect],
                  ['startConstruction', CAMPAIGN.constructionStart],
                  ['completion', CAMPAIGN.completionDate ?? 'TBD'],
                ].map(([key, value]) => (
                  <div key={key} className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-[13px] text-ink-60">{t(`facts.${key}`)}</dt>
                    <dd className="text-body text-ink tabular-nums text-end">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-[13px] text-ink-60">
                {t('facts.completionNote')}
              </p>
            </div>
            <div>
              <h2 className="mb-4 font-serif text-card text-ink">{t('capacity.heading')}</h2>
              <ul className="space-y-4 text-body text-ink">
                <li>
                  <span className="block text-[13px] text-ink-60">{t('capacity.women')}</span>
                  {CAMPAIGN.womensPrayerCapacityBefore} → <span className="font-semibold">{CAMPAIGN.womensPrayerCapacityAfter}</span>
                </li>
                <li>
                  <span className="block text-[13px] text-ink-60">{t('capacity.men')}</span>
                  {CAMPAIGN.mensPrayerCapacityBefore} → <span className="font-semibold">{CAMPAIGN.mensPrayerCapacityAfter}</span>
                </li>
                <li>
                  <span className="block text-[13px] text-ink-60">{t('capacity.school')}</span>
                  {CAMPAIGN.pupils} {t('capacity.pupils')} · {CAMPAIGN.teachers} {t('capacity.teachers')}
                </li>
              </ul>
            </div>
          </div>
        </SectionBody>
      </Section>

      <Section tone="paper">
        <SectionBody>
          <SectionHeading>{t('ways.heading')}</SectionHeading>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {(['once', 'monthly', 'sadaqa', 'company'] as const).map((k) => (
              <Link
                key={k}
                href={`/${l}/gi-en-gave#${k}`}
                className="block border border-rule bg-paper-2 p-6 hover:border-ink"
              >
                <h3 className="mb-2 font-serif text-card text-ink">{t(`ways.${k}.title`)}</h3>
                <p className="text-body text-ink-60">{t(`ways.${k}.body`)}</p>
              </Link>
            ))}
          </div>
        </SectionBody>
      </Section>
          <ProjectAssurance
        heading={tp('assurance.heading')}
        lede={tp('assurance.lede')}
        items={tp.raw('assurance.items') as { title: string; body: string }[]}
      />
    </main>
  );
}
