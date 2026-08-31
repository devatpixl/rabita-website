import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Accent } from './accent';
import { SectionBody } from './primitives';

// The services index opens on a full-bleed photograph with the words in front
// of it (client, 2026-08-31), rather than the split "text left / picture in a
// box right" that the subject pages use.
//
// Deliberately bare: an eyebrow, a headline, a line of prose. No card, no
// buttons, no figures. The mosque-project hero earns its giving card because
// that page is asking for money; this page is only saying "here is what we
// do", so anything else on top of the picture would be furniture.
//
// ServiceHero (components/service-page.tsx) is untouched and still runs all
// eleven /tjenester/[subject] pages — this is the index only.
//
// Same photograph as the homepage hero, on purpose: it is the one picture of
// the congregation actually doing something together, and repeating it across
// the two entry points makes them feel like one site rather than two.
const GRADE = 'saturate(0.78) contrast(1.06) brightness(0.86)';

export async function ServicesHero() {
  const tp = await getTranslations('servicePages');

  return (
    // The negative margin pulls the picture up under the sticky header so it
    // starts at the very top of the screen. It has to match the header's real
    // height: 60px on a phone, 77 from md up.
    <section className="relative isolate -mt-[60px] flex min-h-[78svh] items-end overflow-hidden bg-dusk pt-[60px] text-paper md:-mt-[77px] md:min-h-[82svh] md:pt-[77px]">
      <div aria-hidden className="absolute inset-0 -z-10">
        {/* Two crops of the same frame: the 4:5 for phones, the 16:9 above.
           A 16:9 hero on a portrait screen crops to a sliver of the middle. */}
        <Image
          src="/hero/volunteers-gateiftar-4x5.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[32%_42%] md:hidden"
          style={{ filter: GRADE }}
        />
        <Image
          src="/hero/volunteers-gateiftar-16x9.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hidden object-cover object-[32%_42%] md:block"
          style={{ filter: GRADE }}
        />

        {/* Three passes, each doing one job:
           1. an even veil, so no crop of the photo can wash out the type;
           2. a foot-up gradient, because the words sit at the bottom;
           3. a reading-side wash from md, where the text is only half the
              width and the right of the frame should stay picture. */}
        <div className="absolute inset-0 bg-dusk/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-dusk via-dusk/70 to-dusk/10" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-dusk/85 via-dusk/40 to-transparent md:block" />
      </div>

      <SectionBody className="pb-14 pt-24 md:pb-20 md:pt-32">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
          {tp('pages.services.eyebrow')}
        </p>
        <h1 className="mt-5 max-w-[16ch] font-serif text-display text-balance text-paper">
          {tp.rich('pages.services.title', {
            em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
          })}
        </h1>
        <p className="mt-6 max-w-[52ch] text-body text-paper/80">{tp('pages.services.lede')}</p>
      </SectionBody>
    </section>
  );
}
