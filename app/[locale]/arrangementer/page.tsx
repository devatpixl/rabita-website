import Link from 'next/link';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionBody } from '@/components/primitives';
import { VisitClose, VisitHero } from '@/components/visit-page';

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
  const tv = await getTranslations({ locale, namespace: 'visitPages' });
  const l = await getLocale();
  const fmt = new Intl.DateTimeFormat(l === 'en' ? 'en-GB' : l === 'ar' ? 'ar-EG' : 'nb-NO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <main>
      <VisitHero
        crumb={tv('crumb')}
        eyebrow={tv('pages.events.eyebrow')}
        title={tv('pages.events.title')}
        lede={tv('pages.events.lede')}
        image="/photos/visit-iftar-street.webp"
        alt={tv('pages.events.caption')}
        facts={tv.raw('pages.events.facts') as { term: string; detail: string }[]}
      />
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
                <Link href={`/${l}/arrangementer/${e.slug}`} className="inline-flex min-h-11 min-w-11 items-center justify-center text-body font-semibold text-ink underline underline-offset-4">
                  {t('rsvp')}
                </Link>
              </li>
            ))}
          </ul>
        </SectionBody>
      </Section>
      <VisitClose
        heading={tv('pages.events.closeHeading')}
        body={tv('pages.events.closeBody')}
        image="/photos/visit-eid.webp"
        alt={tv('pages.events.caption')}
        primary={{ label: tv('pages.events.closePrimary'), href: `/${locale}/besok-oss` }}
        secondary={{ label: tv('pages.events.closeSecondary'), href: `/${locale}/kontakt` }}
      />
    </main>
  );
}
