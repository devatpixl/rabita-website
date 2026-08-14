import Link from 'next/link';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { Section, SectionBody } from '@/components/primitives';

// §4.09. Every event captures a signup and "the list must be exportable"
// — that's admin work, deferred. Public index lives here.
const EVENTS = [
  { slug: 'ramadan-iftar-2026', date: '2026-02-18', key: 'ramadan' as const },
  { slug: 'aabent-hus-oktober', date: '2026-10-05', key: 'lecture' as const },
  { slug: 'skolebesok-host', date: '2026-09-12', key: 'school' as const },
];

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'eventsPage' });
  const l = await getLocale();
  const fmt = new Intl.DateTimeFormat(l === 'en' ? 'en-GB' : l === 'ar' ? 'ar-EG' : 'nb-NO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <main>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />
      <Section tone="paper">
        <SectionBody>
          <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {EVENTS.map((e) => (
              <li key={e.slug} className="border-t border-rule pt-6">
                <p className="mb-3 text-[13px] text-ink-60 tabular-nums">
                  {fmt.format(new Date(e.date))}
                </p>
                <h2 className="mb-3 font-serif text-card text-ink">{t(`items.${e.key}.title`)}</h2>
                <p className="mb-6 text-body text-ink-60">{t(`items.${e.key}.body`)}</p>
                <Link href={`/${l}/arrangementer/${e.slug}`} className="text-body font-semibold text-ink underline underline-offset-4">
                  {t('rsvp')}
                </Link>
              </li>
            ))}
          </ul>
        </SectionBody>
      </Section>
    </main>
  );
}
