import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { Eyebrow, Section, SectionBody, SectionHeading } from './primitives';

// §4.09. Three cards. Every event captures a signup and the list must be
// exportable — that goes on the /arrangementer admin side. Homepage shows
// the next three upcoming, hand-curated for now.
type Event = {
  slug: string;
  dateISO: string;
  key: 'ramadan' | 'lecture' | 'school';
  photo: string;
};

const EVENTS: Event[] = [
  { slug: 'ramadan-iftar-2026', dateISO: '2026-02-18', key: 'ramadan', photo: '/photos/event-ramadan.webp' },
  { slug: 'aabent-hus-oktober', dateISO: '2026-10-05', key: 'lecture', photo: '/photos/event-talk.webp' },
  { slug: 'skolebesok-host', dateISO: '2026-09-12', key: 'school', photo: '/photos/event-workshop.webp' },
];

export async function NewsEvents() {
  const t = await getTranslations('newsEvents');
  const locale = await getLocale();
  const dateFmt = new Intl.DateTimeFormat(
    locale === 'en' ? 'en-GB' : locale === 'ar' ? 'ar-EG' : 'nb-NO',
    { day: 'numeric', month: 'long', year: 'numeric' },
  );

  return (
    <Section id="aktuelt" tone="paper">
      <SectionBody>
        <div className="mb-10 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <Eyebrow>{t('eyebrow')}</Eyebrow>
            <SectionHeading className="mt-3">{t('heading')}</SectionHeading>
          </div>
          <Link
            href={`/${locale}/arrangementer`}
            className="text-body font-semibold text-ink underline underline-offset-4 hover:decoration-2"
          >
            {t('all')}
          </Link>
        </div>

        <ul className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {EVENTS.map((e) => (
            <li key={e.slug} className="flex flex-col">
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-paper-2 mb-5">
                <Image
                  src={e.photo}
                  alt={t(`items.${e.key}.title`)}
                  fill
                  sizes="(min-width: 768px) 33vw, 90vw"
                  className="object-cover editorial-photo"
                />
              </div>
              <p className="mb-3 text-[13px] text-ink-60 tabular-nums">
                {dateFmt.format(new Date(e.dateISO))}
              </p>
              <h3 className="mb-3 font-serif text-card text-ink">
                {t(`items.${e.key}.title`)}
              </h3>
              <p className="mb-6 text-body text-ink-60">{t(`items.${e.key}.body`)}</p>
              <Link
                href={`/${locale}/arrangementer/${e.slug}`}
                className="mt-auto text-[14px] text-ink underline decoration-gold decoration-1 underline-offset-4"
              >
                {t('rsvp')} →
              </Link>
            </li>
          ))}
        </ul>
      </SectionBody>
    </Section>
  );
}
