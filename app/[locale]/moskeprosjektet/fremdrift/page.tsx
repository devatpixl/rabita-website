import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Accent } from '@/components/accent';
import { ProgressPhases } from '@/components/progress-phases';
import { ProgressTimeline } from '@/components/progress-timeline';
import { Section, SectionBody } from '@/components/primitives';
import type { AppLocale } from '@/i18n/routing';

// Fremdrift — where the project has got to, and what is still to come.
//
// The nav has promised this page for months: the /moskeprosjektet blurb reads
// "Sju etasjer, tegninger og tidslinje", and until now there was no tidslinje.
//
// Everything on it comes from the client's fremdrift brochure (2026-09-01):
// six chapters by year, and five funded phases. Nothing is invented — where
// the brochure is silent, so is this page. In particular there is still no
// completion DATE anywhere here; 2028 is named as the last phase's year,
// which is what the brochure says, and that is a different claim from "the
// building opens on ___". See the §13.1 note in lib/campaign.ts.
//
// Imagery is thin on purpose. There is not one construction photograph in the
// library — the whole set is renders of the finished building plus community
// pictures, the single exception being community/site-cleared.webp. That one
// goes to 2025, because it is literally what 2025 was; the earlier years are
// set as type. A page of renders pretending to be site photography would be
// worse than a page that admits it is a plan.
//
// The cleared-site photograph is PORTRAIT (1125x1500) and was briefly the
// hero here, where a 3.9:1 band threw away 81% of it. It now sits in its own
// chapter at its own proportions, uncropped, and the hero takes the widest
// render on the site instead.

export default async function FremdriftPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'fremdrift' });

  return (
    <main>
      {/* A full-bleed opener with the grade over it, rather than the split
         hero the other project pages use: this page is a story about a
         building rising, so it should open on the building, not on a text
         column beside a picture. Same three-pass grade as the apartments
         film — warm wash, veil, foot gradient — so the two read as siblings. */}
      <section className="relative isolate -mt-[60px] flex min-h-[78svh] items-end overflow-hidden bg-dusk pt-[60px] text-paper md:-mt-[77px] md:min-h-[84svh] md:pt-[77px]">
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image
            src="/photos/fremdrift/completion.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_45%]"
          />
          <div className="absolute inset-0 bg-gold-deep/20 mix-blend-multiply" />
          <div className="absolute inset-0 bg-dusk/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-dusk via-dusk/55 to-transparent" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-28 md:pb-20 md:pt-32">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
            {t('heroEyebrow')}
          </p>
          <h1 className="mt-5 max-w-[15ch] font-serif text-display text-balance text-paper">
            {t.rich('heroTitle', { em: (chunks) => <Accent surface="dusk">{chunks}</Accent> })}
          </h1>
          <p className="mt-6 max-w-[52ch] text-body text-paper/80">{t('heroLede')}</p>
        </div>
      </section>

      {/* The six years, pinned and scrolled. */}
      <ProgressTimeline />

      {/* ── the five phases ─────────────────────────────────────────────── */}
      <Section tone="paper">
        <SectionBody>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
            {t('phasesEyebrow')}
          </p>
          <h2 className="mt-4 max-w-2xl font-serif text-section text-balance text-ink">
            {t('phasesHeading')}
          </h2>
          <div className="mt-12 md:mt-16">
            <ProgressPhases locale={locale as AppLocale} />
          </div>
        </SectionBody>
      </Section>
    </main>
  );
}
