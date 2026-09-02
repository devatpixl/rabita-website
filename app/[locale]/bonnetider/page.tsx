import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionBody } from '@/components/primitives';
import { PrayerBoard } from '@/components/prayer-board';
import { CalendarDownload } from '@/components/calendar-download';
import { Imams } from '@/components/imams';
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
      {/* A band inside the measure, not a full bleed one, and desktop only.

         Framed like the image on /besok-oss: contained to the content column
         with rounded-3xl, so it reads as part of the page rather than as a
         header pasted across the top. Very wide and short, because this page
         exists to answer one question and the six times have to stay on the
         first screen.

         The crop sits on the front rows of the congregation, which is what
         makes the subject legible in a 184px slice: an interior shot would
         only show arches at this height. */}
      <div className="hidden md:block">
        <SectionBody>
          {/* The band carries the page's title now (client, 2026-08-31) rather
             than being a bare strip with the label underneath it. Same height,
             same crop — the words simply sit on the picture, which is where a
             masthead belongs and is also how this page finally gets an h1.
             (It had none: the ServiceHero that used to supply one was dropped
             when the times moved above the fold.) */}
          <div className="relative mt-5 aspect-[5/2] max-h-[15rem] w-full overflow-hidden rounded-3xl bg-dusk">
            <Image
              src="/photos/prayer-band.webp"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: '50% 62%', filter: GRADE }}
            />
            {/* Reading-side scrim. Two utilities rather than one, because a
               gradient direction is physical: in Arabic the words sit at the
               right, so the dark end has to move with them. */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-dusk via-dusk/75 to-dusk/5 rtl:bg-gradient-to-l"
            />
            <div className="absolute inset-y-0 start-0 flex max-w-[36rem] flex-col justify-center ps-8 pe-6 lg:ps-10">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
                {tp('crumb')}
              </p>
              <h1 className="mt-2 font-serif text-[clamp(1.65rem,3vw,2.3rem)] leading-none text-paper">
                {tp('pages.times.eyebrow')}
              </h1>
              <p className="mt-2 text-[13px] leading-snug text-paper/75">
                {tp('pages.times.ledeShort')}
              </p>
            </div>
          </div>
        </SectionBody>
      </div>

      {/* Tight to the image on purpose. The crumb and the date used to be two
         stacked lines with 32px between them and 48px above, which pushed the
         board's foot off a 13" laptop screen — you could not see the progress
         rail without scrolling. They are one baseline row now (inside
         PrayerBoard), and the section opens on 24px instead of 48. */}
      <Section tone="paper" className="pt-6 md:pt-8">
        <SectionBody>
          {/* The band above carries the h1, but it is desktop-only, so phones
             would have had none at all. This supplies one without changing
             what a phone shows: the board underneath already announces itself,
             and the client asked for no mobile changes here.

             Both h1s stay in the markup; md:hidden and the band's own
             hidden md:block mean only ever one of them is in a rendered
             subtree, so only one reaches the accessibility tree. */}
          <h1 className="sr-only md:hidden">{tp('pages.times.eyebrow')}</h1>
          <PrayerBoard eyebrow={tp('crumb')} />
        </SectionBody>
      </Section>

      {/* The imams, straight after the times — who leads the prayer is the
         second thing a visitor wants to know. The editorial block and the
         "two practical things" cards that sat here are gone (client
         2026-08-30: simpler, like ICC's page). */}
      <Imams />

      {/* The calendar sits after the imams (client 2026-08-30) and as its own
         band: as a hairline row of chips under the times, nobody could see
         the site had a printable calendar at all. */}
      <CalendarDownload />

      {/* The "Coming in person" band (ServiceVisit) was removed on 2026-08-31:
         it repeated verbatim on this page, the services index and all eleven
         subject pages, so the address stopped registering as information and
         started reading as furniture. It survives on /besok-oss, which is the
         page that exists to answer it. The component is left in
         components/service-page.tsx, unused, so it can go back with one line. */}

      {/* The "digital clock" board that sat here as a test on 2026-08-30 was
         removed on 2026-08-31 — the client saw it and did not want it. The
         component (components/prayer-clock.tsx) is left in the tree, unused,
         so it can be dropped back in with one line if that changes. */}

      {/* The page's ask. Six seconds, once, then quiet for a month. */}
      <TimedCta ns="cta.prayer" storageKey="rabita:cta:prayer:v1" delayMs={6000} amountNok={10} showVideoInAsk />
    </main>
  );
}
