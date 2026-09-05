import { getTranslations } from 'next-intl/server';
import { PageBand } from './page-band';
import { Accent } from './accent';

// The services index, on the band the prayer page opens on (client,
// 2026-09-05).
//
// This replaces the full-bleed photograph the client asked for on
// 2026-08-31. The reversal is deliberate and it is theirs: they picked the
// prayer band as the design they want the section pages to share, and an
// index that does not belong to the family its own children belong to is
// the odd one out rather than the parent.
//
// It stays the parent by being the TALLEST band on the site — roughly a
// 21:9 plate against the subject pages' 17rem — and by keeping text-display
// for its headline where the eleven services clamp at 2.3rem. Same
// vocabulary, one rank up.
//
// The photograph is the 2560x1440 gateiftar crop, the only hero-grade asset
// in the repo, so it carries `over` at full measure without breaking a
// sweat. The old art-directed 4:5 phone crop is no longer needed: a
// contained band is never taller than it is wide, so the 16:9 frame holds
// at every width.

export async function ServicesHero() {
  const t = await getTranslations('servicesIndex');
  const tp = await getTranslations('servicePages');

  return (
    <PageBand
      kicker={tp('pages.services.eyebrow')}
      kickerNote={t('eyebrow')}
      title={tp.rich('pages.services.title', {
        em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
      })}
      lede={tp('pages.services.lede')}
      image="/hero/volunteers-gateiftar-16x9.webp"
      objectClass="object-[32%_42%]"
      layout="over"
      mark="elevation"
      // A rank above the eleven bands it is the parent of.
      heightClass="min-h-[26rem] md:min-h-[30rem]"
      titleClass="text-display"
      sizes="(min-width: 1152px) 1104px, calc(100vw - 3rem)"
    />
  );
}
