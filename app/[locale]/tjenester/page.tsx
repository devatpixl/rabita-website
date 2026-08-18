import Link from 'next/link';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { Section, SectionBody } from '@/components/primitives';

// §6: /tjenester (nikah, janaza, shahada, counselling, hajj/umrah — each
// its own page and request form, named in the words a member would type).
const SUBJECTS = ['nikah', 'janaza', 'shahada', 'counselling', 'hajj-umrah'] as const;

export default async function ServicesIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'servicesIndex' });
  const l = await getLocale();

  return (
    <main>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />
      <Section tone="paper">
        <SectionBody>
          <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {SUBJECTS.map((s) => (
              <li key={s} className="border-t border-rule pt-6">
                <h2 className="mb-2 font-serif text-card text-ink">{t(`items.${s}.title`)}</h2>
                <p className="mb-4 text-body text-ink-60">{t(`items.${s}.body`)}</p>
                <Link href={`/${l}/tjenester/${s}`} className="inline-flex min-h-11 items-center text-body font-semibold text-ink underline underline-offset-4">
                  {t('more')}
                </Link>
              </li>
            ))}
          </ul>
        </SectionBody>
      </Section>
    </main>
  );
}
