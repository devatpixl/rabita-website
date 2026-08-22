import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionBody } from '@/components/primitives';
import { PrayerNow } from '@/components/prayer-now';
import { CalendarDownload } from '@/components/calendar-download';
import { ServiceCards, ServiceVisit } from '@/components/service-page';
import { TimedCta } from '@/components/timed-cta';

// The times come first. Everything else on this page is preamble.
//
// This page used to open with the standard ServiceHero — headline, prose and
// a large image — with the times below it, which meant the one thing 30 000
// people a month arrive for sat under the fold. Shrinking the hero to make
// room was the wrong lever: it made the type small on a wide screen and the
// times still did not fit. So the order changed instead. The establishing
// image and prose still exist, one section down, where preamble belongs.

const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

export default async function BonnetiderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tp = await getTranslations({ locale, namespace: 'servicePages' });

  return (
    <main>
      {/* A band, not a hero. This page exists to answer one question and the
         answer has to stay on the first screen, so the picture is given width
         instead of height: full bleed, and capped at 14vh so it can never
         push the six times below the fold. The crop sits on the rosette in
         the ceiling of the new main hall, which reads at a glance even in a
         120px slice. */}
      <div className="relative h-[clamp(96px,14vh,170px)] w-full overflow-hidden bg-dusk">
        <Image
          src="/photos/room-main-hall.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: '55% 32%', filter: GRADE }}
        />
      </div>

      <Section tone="paper" className="pt-section-sm">
        <SectionBody>
          <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-ink-60">
            {tp('crumb')}
          </p>
          <div className="mt-8">
            <PrayerNow />
          </div>
          <CalendarDownload />
        </SectionBody>
      </Section>

      {/* The editorial block, demoted below the answer. */}
      <Section tone="paper-2">
        <SectionBody>
          <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-6">
              <h2 className="font-serif text-section text-balance text-ink">
                {tp('pages.times.title')}
              </h2>
              <p className="mt-6 max-w-prose text-body text-ink-60">{tp('pages.times.lede')}</p>
            </div>
            <div className="md:col-span-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-paper">
                <Image
                  src="/photos/svc-prayer.webp"
                  alt={tp('pages.times.eyebrow')}
                  fill
                  sizes="(min-width: 768px) 48vw, 90vw"
                  className="object-cover"
                  style={{ filter: GRADE }}
                />
              </div>
            </div>
          </div>
        </SectionBody>
      </Section>

      <ServiceCards
        eyebrow={tp('pages.times.cardEyebrow')}
        heading={tp('pages.times.cardHeading')}
        cards={[
          { ...(tp.raw('pages.times.cards') as { title: string; body: string }[])[0], image: '/photos/svc-friday.webp' },
          { ...(tp.raw('pages.times.cards') as { title: string; body: string }[])[1], image: '/photos/svc-wudu.webp' },
        ]}
      />
      <ServiceVisit
        heading={tp('visit.heading')}
        body={tp('visit.body')}
        address="Calmeyers gate 8"
        postal="0183 Oslo"
        hours={tp('visit.hours')}
        primary={{ label: tp('visit.primary'), href: `/${locale}/besok-oss` }}
        secondary={{ label: tp('visit.secondary'), href: `/${locale}/kontakt` }}
      />

      {/* The page's ask. Six seconds, once, then quiet for a month. */}
      <TimedCta ns="cta.prayer" storageKey="rabita:cta:prayer:v1" delayMs={6000} amountNok={10} />
    </main>
  );
}
