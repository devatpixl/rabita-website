import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { Eyebrow, Section, SectionBody, SectionHeading } from '@/components/primitives';
import { VisitClose } from '@/components/visit-page';
import { PageBand } from '@/components/page-band';
import { FigureIcon, type FigureIconName } from '@/components/figure-icons';
import { EVENT_PAGES } from '@/lib/event-pages';

// The three facts in the order the copy lists them (what happens, who may
// come, price), each given the mark that says what kind of fact it is.
const FACT_ICONS: FigureIconName[] = ['calendar', 'people', 'check'];

// The site's own grade, as on every other photograph in this section.
const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

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
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const facts = tv.raw('pages.events.facts') as { term: string; detail: string }[];

  return (
    <main>
      {/* The band, in the family /besok-oss and every service page open on
         (client, 2026-09-08: "take full inspiration from visit us"). This
         page used to run VisitHero — a bare crumb, then a naked 21:9
         photograph with no words on it, and the headline only underneath.
         That is the shape the visit page was moved off; the two events pages
         were left on it deliberately at the time and this is them catching
         up. VisitHero itself is untouched and now has no callers, so it can
         go whenever someone wants to sweep it.

         The photograph is unchanged: at band crop it is the brightest and
         highest-resolution frame in the events set (2000x1100, 1.81 source
         pixels per CSS pixel) and it reads as warm texture behind a
         headline rather than competing with it.

         The headline pair swaps namespaces on purpose, exactly as /om-oss
         does: visitPages' pair is the long evocative one and belongs on the
         picture, and eventsPage.title/lede — written, and until now never
         rendered anywhere — is the short declarative pair that gives the
         list below the heading it has never had. No new copy. */}
      <PageBand
        kicker={tv('crumb')}
        kickerNote={tv('pages.events.eyebrow')}
        title={tv('pages.events.title')}
        lede={tv('pages.events.lede')}
        image="/photos/visit-iftar-street.webp"
        alt={tv('pages.events.caption')}
        layout="over"
        mark="rosette"
        tone="warm"
        padBottom="none"
      >
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60">
          {tv('pages.events.caption')}
        </p>
      </PageBand>

      {/* Same ground and same furniture as the visit section: the bloom, the
         mosque's own mark as texture, and the seam that fades the band's
         plate into it instead of cutting. */}
      <Section tone="paper-2" className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 end-[4%] -z-10 h-[34rem] w-[34rem] rounded-full bg-gold/[0.06] blur-3xl"
        />
        {/* Its own childless layer: .star-texture sets `> * { position:
           relative }` and would drop any absolutely positioned sibling into
           the flow. */}
        <div
          aria-hidden
          className="star-texture star-texture--light pointer-events-none absolute inset-0 -z-10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-paper to-paper-2 md:h-40"
        />
        <SectionBody>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <Eyebrow tone="gold-deep">{tv('pages.events.eyebrow')}</Eyebrow>
              <SectionHeading className="mt-5">{t('title')}</SectionHeading>
              <p className="mt-5 max-w-[44ch] text-body text-ink-60">{t('lede')}</p>
            </div>

            {/* The three facts, as marked rows rather than the plain rail
               VisitHero printed under the picture. */}
            <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-3 lg:col-span-7 lg:self-center">
              {facts.map((f, i) => (
                <li key={f.term} className="flex items-start gap-3.5">
                  <span
                    aria-hidden
                    className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-soft/40 text-gold-deep ring-1 ring-gold-deep/20"
                  >
                    <FigureIcon name={FACT_ICONS[i] ?? 'calendar'} className="h-[18px] w-[18px]" />
                  </span>
                  <span className="block min-w-0">
                    <span className="block font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-60">
                      {f.term}
                    </span>
                    <span className="mt-1 block text-[15px] leading-snug text-ink">{f.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* The events themselves. They were three text blocks under a
             hairline with no picture between them; each is now a card in the
             language the visit page's photograph established — the same
             grade, the same cut corner, the same floating pill, the same
             slow scale on hover. The whole card is the link, so the target
             is the card and not six words of it. */}
          <ul className="mt-14 grid gap-8 md:grid-cols-3">
            {EVENT_PAGES.map((e) => (
              <li key={e.slug}>
                <Link
                  href={`/${l}/arrangementer/${e.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] rounded-se-[3rem] bg-paper shadow-[0_1px_2px_rgba(26,26,24,0.04),0_18px_44px_-34px_rgba(26,26,24,0.3)] ring-1 ring-ink/5 transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(26,26,24,0.05),0_26px_60px_-34px_rgba(26,26,24,0.4)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-paper-deep">
                    <Image
                      src={e.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, calc(100vw - 3rem)"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                      style={{ filter: GRADE }}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-dusk/70 to-transparent"
                    />
                    <span className="absolute bottom-3.5 start-3.5 inline-flex items-center rounded-full bg-paper/95 px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.16em] tabular-nums text-ink shadow-[0_2px_10px_-2px_rgba(26,26,24,0.35)] backdrop-blur-sm">
                      <bdi dir="ltr">{fmt.format(new Date(e.date))}</bdi>
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-serif text-card text-ink">{t(`items.${e.key}.title`)}</h3>
                    <p className="mt-2.5 text-[15px] leading-snug text-ink-60">
                      {t(`items.${e.key}.body`)}
                    </p>
                    {/* mt-auto so the three cards' calls to action sit on one
                       line however long the bodies run. */}
                    <span className="mt-auto flex items-center gap-2.5 pt-6 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink transition-colors group-hover:text-gold-deep">
                      {t('rsvp')}
                      <span
                        aria-hidden
                        className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                      >
                        &rarr;
                      </span>
                    </span>
                  </div>
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
