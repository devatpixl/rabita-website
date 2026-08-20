import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { GivingCard } from '@/components/giving-card';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';

import { Accent } from '@/components/accent';
import {
  ProjectAssurance,
  ProjectBrief,
  ProjectColumns,
  ProjectHero,
} from '@/components/project-page';
// §6: `/gi-en-gave` treatment — evening facade full-bleed feel, two words
// over it, giving card below the fold. Split into named routes: one-off,
// monthly, dedication, company, legacy. Somebody giving 200 000 needs a
// different path from somebody giving 200.
export default async function GiveIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tp = await getTranslations({ locale, namespace: 'projectPages' });
  const t = await getTranslations({ locale, namespace: 'givePage' });
  const l = await getLocale();

  const routes = [
    { hash: 'once', href: `/${l}/gi-en-gave` },
    { hash: 'monthly', href: `/${l}/gi-en-gave` },
    { hash: 'sadaqa', href: `/${l}/doner-en-bonneplass` },
    { hash: 'company', href: `/${l}/gi-en-gave` },
    { hash: 'legacy', href: `/${l}/gi-en-gave` },
  ] as const;

  return (
    <main>
      <ProjectHero
        crumb={tp('crumb')}
        eyebrow={tp('pages.give.eyebrow')}
        title={tp.rich('pages.give.title', {
          em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
        })}
        lede={tp('pages.give.lede')}
        image="/photos/hero-give.webp"
        alt={tp('pages.give.eyebrow')}
        primary={{ label: tp('pages.give.primary'), give: true }}
        secondary={{ label: tp('pages.give.secondary'), href: `/${locale}/hvor-pengene-gar` }}
      />
      <ProjectBrief label={tp('pages.give.briefLabel')} body={tp('pages.give.brief')} />
      <ProjectColumns
        eyebrow={tp('pages.give.colEyebrow')}
        heading={tp('pages.give.colHeading')}
        items={tp.raw('pages.give.items') as { title: string; body: string }[]}
      />
      <Section tone="paper" id="gikort">
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-6">
              <SectionHeading>{t('cardHeading')}</SectionHeading>
              <p className="mt-4 text-body text-ink">{t('cardLede')}</p>
              <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-3xl bg-paper-2">
                <Image
                  src="/photos/give-bazar.webp"
                  alt={t('cardHeading')}
                  fill
                  loading="eager"
                  sizes="(min-width: 768px) 46vw, 90vw"
                  className="object-cover"
                  style={{ filter: 'saturate(0.72) contrast(1.12) brightness(0.9)' }}
                />
              </div>
            </div>
            <div className="md:col-span-6">
              <GivingCard />
            </div>
          </div>
        </SectionBody>
      </Section>

      <Section tone="paper-2" id="routes">
        <SectionBody>
          <SectionHeading>{t('routes.heading')}</SectionHeading>
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {routes.map((r) => (
              <li key={r.hash} className="border-t border-rule pt-6">
                <h3 className="mb-2 font-serif text-card text-ink">{t(`routes.${r.hash}.title`)}</h3>
                <p className="mb-4 text-body text-ink-60">{t(`routes.${r.hash}.body`)}</p>
                <Link
                  href={r.href}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center text-body font-semibold text-ink underline underline-offset-4"
                >
                  {t('routes.cta')}
                </Link>
              </li>
            ))}
          </ul>
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
