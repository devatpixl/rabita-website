import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { GIFTS } from '@/lib/gifts';
import { formatAmount } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { Accent } from './accent';
import { Eyebrow, SectionBody } from './primitives';
import { GiveCTA } from './give-cta';

// What your gift builds. Same four costed items and the same copy the ladder
// used, shown as photographs rather than as a stack of figures, which is the
// version Rabita asked for.
//
// On dusk on purpose. Between Four chapters and the events list the page runs
// eight sections of warm off white in a row, and three of the tones are within
// a few percent of each other, so the whole middle of the page reads as one
// surface. Dusk is already in the palette, the hero and the membership band
// both use it, so this breaks the run without introducing anything new.
//
// The grade matches the hero and the zoom band, so the photographs belong to
// this site rather than looking dropped in.
const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

const SHOTS: Record<string, string> = {
  prayer: '/photos/gift-prayer.webp',
  shelf: '/photos/gift-library.webp',
  desk: '/photos/gift-school.webp',
  panel: '/photos/gift-facade.webp',
};

export async function GiftBuilds() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('giftLadder');

  return (
    <section
      id="hva-din-gave-bygger"
      aria-labelledby="gift-builds-heading"
      className="bg-dusk py-section-lg text-paper"
    >
      <SectionBody>
        <div className="max-w-3xl">
          <Eyebrow tone="gold">{t('eyebrow')}</Eyebrow>
          <h2
            id="gift-builds-heading"
            className="mt-4 font-serif text-section text-balance text-paper"
          >
            {t.rich('heading', {
              em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
            })}
          </h2>
        </div>

        <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {GIFTS.map((g, i) => (
            <li key={g.key} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
                <Image
                  src={SHOTS[g.key]}
                  alt={t(`alt.${g.key}`)}
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  style={{ filter: GRADE }}
                />
              </div>

              <p className="mt-5 flex items-center gap-3 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-gold">
                <span aria-hidden className="h-px w-6 bg-gold/50" />
                {String(i + 1).padStart(2, '0')}
              </p>

              <p className="mt-3 font-serif text-[clamp(1.6rem,2.4vw,2.1rem)] leading-none tabular-nums text-gold">
                {formatAmount(locale, g.amountNok)}{' '}
                <span className="text-[0.55em] text-dusk-60">kr</span>
              </p>

              <h3 className="mt-3 font-serif text-card text-paper">
                {t(`items.${g.key}.title`)}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-dusk-60">
                {t(`items.${g.key}.meta`)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4">
          <GiveCTA label={t('cta')} />
          <p className="text-[13.5px] text-dusk-60">{t('footnote')}</p>
        </div>
      </SectionBody>
    </section>
  );
}
