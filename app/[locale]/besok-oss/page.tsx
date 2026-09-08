import Image from 'next/image';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Eyebrow, Section, SectionBody, SectionHeading } from '@/components/primitives';
import { VisitClose } from '@/components/visit-page';
import { PageBand } from '@/components/page-band';
import { RequestForm } from '@/components/request-form';
import { FigureIcon, type FigureIconName } from '@/components/figure-icons';

// The three facts in the same order the copy lists them (Address, Open, How
// to get here), each given the mark that says what kind of fact it is.
const FACT_ICONS: FigureIconName[] = ['pin', 'clock', 'route'];

export default async function VisitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'visitPage' });
  const tv = await getTranslations({ locale, namespace: 'visitPages' });
  const facts = tv.raw('pages.visit.facts') as { term: string; detail: string }[];

  return (
    <main>
      {/* The band, in the family the prayer page opens on (client,
         2026-09-05). This page used to show the photograph with no words on
         it and the headline underneath — two objects where there should be
         one, which is exactly what the band fixes.

         `over` rather than `split`: visit-entrance.webp is 2000x1100, wide
         enough to carry the words at full measure. Only ~45% of the frame
         survives the crop, so the object position is hand-set to keep the
         entrance itself.

         No kickerNote: visitPages.crumb and pages.visit.eyebrow are the
         same string, which is why VisitHero carried an `eyebrow !== crumb`
         guard. The band prints the crumb once and the guard dies with it.

         VisitFacts no longer hangs under the plate. The three facts moved
         down into the section below, where the client's mockup puts them —
         each with a mark, beside the address rather than under the picture.
         The component itself is untouched: /arrangementer and every event
         page still render it through VisitHero.

         mark="elevation" belongs here more than anywhere: this is the one
         page whose subject is the building. */}
      <PageBand
        kicker={tv('crumb')}
        title={tv('pages.visit.title')}
        lede={tv('pages.visit.lede')}
        image="/photos/visit-entrance.webp"
        alt={tv('pages.visit.caption')}
        layout="over"
        mark="elevation"
        objectClass="object-[50%_58%] md:object-[50%_50%]"
        padBottom="none"
      />

      {/* The visit, laid out to the client's mockup (2026-09-07): the address
         as the headline with a chip over it, the three facts as marked rows
         beneath, a photograph with a floating pill, and the booking form on a
         raised card beside it.

         Everything here is the vocabulary the service pages already use — the
         Eyebrow's own rule, the gold seal from follow-us.tsx, the star-texture
         ground, the paper card with sunken wells. Nothing new was invented for
         this page; it was simply never given the language the rest of the site
         had grown. */}
      <Section tone="paper-2" className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 end-[4%] -z-10 h-[34rem] w-[34rem] rounded-full bg-gold/[0.06] blur-3xl"
        />
        {/* The mosque's own mark as ground. Its own childless layer:
           .star-texture sets `> * { position: relative }` and would drop any
           absolutely positioned sibling into the flow. */}
        <div
          aria-hidden
          className="star-texture star-texture--light pointer-events-none absolute inset-0 -z-10"
        />
        {/* The seam, so the band's plate does not end on the same line the
           ground changes colour. Painted last of the three so the texture and
           the bloom fade in with it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-paper to-paper-2 md:h-40"
        />
        <SectionBody>
          {/* Two columns at lg, three at xl. The quote only appears where
             there is room for it: at lg the form takes 7 of 12 and keeps the
             name/e-mail row genuinely side by side, and at xl the columns
             re-cut to 4/6/2 so the margin note can join without squeezing
             the form back down. gap-10, not gap-16: on a 12-column grid a
             64px gutter eats 704px of a 1104px measure and a two-column
             quote comes out one word wide. */}
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
            {/* ── the place ──────────────────────────────────────────── */}
            <div className="lg:col-span-5 xl:col-span-4">
              {/* A chip, not a rule-and-label. The section's own name sits
                 above the address because the ADDRESS is the headline here —
                 that inversion is the mockup's, and it is right: nobody needs
                 a heading that says "address" over an address. */}
              <p className="inline-flex items-center rounded-full bg-paper px-3.5 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-60 ring-1 ring-ink/10">
                {t('addressHeading')}
              </p>
              <SectionHeading className="mt-5">{CAMPAIGN.address}</SectionHeading>

              <ul className="mt-8 grid gap-x-8 gap-y-6 border-t border-ink/10 pt-7 sm:grid-cols-2 lg:grid-cols-1">
                {facts.map((f, i) => (
                  <li key={f.term} className="flex items-start gap-3.5">
                    <span
                      aria-hidden
                      className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-soft/40 text-gold-deep ring-1 ring-gold-deep/20"
                    >
                      <FigureIcon name={FACT_ICONS[i] ?? 'pin'} className="h-[18px] w-[18px]" />
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

              <p className="mt-7 max-w-[42ch] text-body text-ink-60">{t('groups')}</p>

              {/* The photograph, with the pill floating on it. The label is
                 the existing "see what's on" line and it goes to the events
                 page — a real destination. The mockup's "see more pictures"
                 has nowhere to go: there is no gallery page. */}
              <div className="group relative mt-8 aspect-[4/3] overflow-hidden rounded-[1.5rem] rounded-se-[3.5rem] bg-paper-deep ring-1 ring-ink/5">
                <Image
                  src="/photos/visit-foyer.webp"
                  alt={tv('pages.visit.caption')}
                  fill
                  sizes="(min-width: 1024px) 430px, calc(100vw - 3rem)"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                  style={{ filter: 'saturate(0.72) contrast(1.12) brightness(0.9)' }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-dusk/70 to-transparent"
                />
                <Link
                  href={`/${locale}/arrangementer`}
                  className="group/pill absolute bottom-4 start-4 inline-flex min-h-11 items-center gap-3 rounded-full bg-paper/95 px-4 py-2 text-[14px] font-semibold text-ink shadow-[0_2px_10px_-2px_rgba(26,26,24,0.35)] backdrop-blur-sm transition-colors hover:bg-paper"
                >
                  {tv('pages.visit.closeSecondary')}
                  <span
                    aria-hidden
                    className="transition-transform duration-200 group-hover/pill:translate-x-1 rtl:rotate-180 rtl:group-hover/pill:-translate-x-1"
                  >
                    &rarr;
                  </span>
                </Link>
              </div>
            </div>

            {/* ── the booking ────────────────────────────────────────── */}
            {/* self-center, matching /om-oss: the place column is the taller
               of the two — it carries the photograph — so the form card sat
               at the top of a stretched cell with the slack dumped under it
               (client, 2026-09-08). Only the card moves; the margin note
               keeps its top alignment, which is where marginalia belongs.
               Below lg the columns stack and it is inert. */}
            <div className="lg:col-span-7 lg:self-center xl:col-span-6">
              <RequestForm
                subject="visit"
                card
                rule={false}
                intro={
                  <div className="mb-7">
                    <Eyebrow tone="gold-deep">{t('formHeading')}</Eyebrow>
                    <h2 className="mt-4 font-serif text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-balance text-ink">
                      {t('formTitle')}
                    </h2>
                    <p className="mt-3 max-w-[44ch] text-[15px] leading-snug text-ink-60">
                      {t('formLede')}
                    </p>
                  </div>
                }
              />
            </div>

            {/* ── the margin note ────────────────────────────────────── */}
            {/* Only from xl, and only because there is a spare column there.
               A pull quote squeezed into a 5-column grid is a paragraph with
               delusions; given a margin of its own it is the thing the eye
               rests on after the form. */}
            <aside className="relative hidden xl:col-span-2 xl:block">
              {/* The arch, behind the note. It is a photograph, not a
                 drawing — the fretwork window and the light it throws, from
                 the client (2026-09-07) — but it is graded and washed until
                 it reads as ground rather than as a picture: colour mostly
                 pulled out, warmed towards paper, and taken to 22%.

                 The container is what makes it an arch: a tall box with a
                 9rem top radius and a gold hairline on it, which is the
                 outlined arch the mockup draws. The mask fades the foot away
                 so the shape has no bottom edge to end on.

                 It bleeds past its own column on purpose. -z-10 keeps it
                 behind the card beside it, and the section is
                 overflow-hidden, so it can spill toward the margin without
                 escaping. */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-12 -end-14 -z-10 h-[32rem] w-[19rem] overflow-hidden rounded-t-[9rem] border border-gold-deep/20"
                style={{
                  maskImage:
                    'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 52%, rgba(0,0,0,0) 100%)',
                  WebkitMaskImage:
                    'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 52%, rgba(0,0,0,0) 100%)',
                }}
              >
                <Image
                  src="/photos/arch-light.jpg"
                  alt=""
                  fill
                  // 304px, not "19rem": a sizes value Next cannot resolve to a
                  // viewport width makes it emit the whole width table, down
                  // to 3840w, for a 15KB decoration.
                  sizes="304px"
                  // Eager. It is 15KB, it sits above the fold at the width
                  // that shows it at all, and lazy-loading a background that
                  // is only ever 45% present buys nothing.
                  loading="eager"
                  className="object-cover opacity-[0.45]"
                  // Colour mostly out, pushed warm, so the marble and the
                  // light land in the paper palette rather than beside it.
                  style={{ filter: 'saturate(0.25) sepia(0.45) contrast(1.06) brightness(1.02)' }}
                />
                {/* A last veil in the section's own tone, so the photograph
                   sits IN the ground instead of on it. */}
                <span aria-hidden className="absolute inset-0 bg-paper-2/25" />
              </div>

              <span aria-hidden className="block h-px w-10 bg-gold-deep/40" />
              <p className="mt-6 font-serif text-[1.05rem] italic leading-relaxed text-ink-60">
                {`«${t('quote')}»`}
              </p>
              <Image
                src="/logo/rabita-mark-256.png"
                alt=""
                width={32}
                height={32}
                aria-hidden
                className="mt-7 h-8 w-8 opacity-60"
              />
            </aside>
          </div>
        </SectionBody>
      </Section>

      <VisitClose
        heading={tv('pages.visit.closeHeading')}
        body={tv('pages.visit.closeBody')}
        image="/photos/visit-foyer.webp"
        alt={tv('pages.visit.caption')}
        primary={{ label: tv('pages.visit.closePrimary'), href: `/${locale}/kontakt` }}
        secondary={{ label: tv('pages.visit.closeSecondary'), href: `/${locale}/arrangementer` }}
      />
    </main>
  );
}
