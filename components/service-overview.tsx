import { getTranslations } from 'next-intl/server';
import { Eyebrow, Section, SectionBody } from './primitives';
import type { ServiceKey } from '@/lib/services';

/**
 * Everything you need to know, in one section (pilot, second cut,
 * 2026-09-28).
 *
 * The first cut split this into two cream bands — a description section
 * and a "how it works" section — and each was thin. Together they are one
 * spread: the words on the start side, the sequence on the end side as a
 * raised card.
 *
 * START: the offer heading (offerTitle), the description that was written
 * long ago and never rendered (longBody), the offer lede, and the three
 * offer points as a short ruled list. All four strings existed; two of
 * them had never been on the page.
 *
 * END: "Slik går det til" as a card, the steps numbered in gold discs. The
 * discs are the client's own reference (islamic.no/vigsel, "Krav for
 * nikah") — numbered circles down the left of a list — and the first cut
 * turned them into hairlines because hairlines are the house style. He
 * pointed at discs. The card is the form card's own shell, so the two
 * raised objects on the page are the same object.
 *
 * The card renders only when items.<s>.steps exists; without it the
 * offer list moves into the end column so the spread stays a spread.
 */
export async function ServiceOverview({ s }: { s: ServiceKey }) {
  const t = await getTranslations('servicesIndex');
  const offer = t.has(`items.${s}.offer`) ? (t.raw(`items.${s}.offer`) as { title: string; body?: string; detail?: string }[]) : [];
  const steps = t.has(`items.${s}.steps`) ? (t.raw(`items.${s}.steps`) as { title: string; body: string }[]) : [];
  const hasLong = t.has(`items.${s}.longBody`);
  const hasSteps = Array.isArray(steps) && steps.length > 0;

  const offerList = offer.length > 0 && (
    <div>
      <Eyebrow tone="gold-deep">{t('detail.what')}</Eyebrow>
      <ul className="mt-4 border-t border-ink/20">
        {offer.map((o) => (
          <li key={o.title} className="flex gap-4 border-b border-rule py-3.5">
            <span aria-hidden className="mt-[0.7rem] block h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-deep" />
            <div>
              <p className="font-serif text-[1.15rem] leading-snug text-ink">{o.title}</p>
              {o.body && <p className="mt-1 max-w-[46ch] text-[15px] leading-relaxed text-ink-60">{o.body}</p>}
              {o.detail && <p className="mt-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold-deep">{o.detail}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Section tone="paper" className="md:py-section-lg">
      <SectionBody>
        <div className="md:grid md:grid-cols-12 md:gap-12 lg:gap-16">
          <div className="md:col-span-6">
            <Eyebrow tone="gold-deep">{t('detail.about')}</Eyebrow>
            <h2 className="mt-5 font-serif text-section text-balance text-ink">{t(`items.${s}.offerTitle`)}</h2>
            {hasLong && <p className="mt-6 max-w-prose text-[clamp(1.0625rem,1.15vw,1.2rem)] leading-[1.6] text-ink">{t(`items.${s}.longBody`)}</p>}
            <p className="mt-4 max-w-prose text-body text-ink-60">{t(`items.${s}.offerLede`)}</p>
            {hasSteps && <div className="mt-10">{offerList}</div>}
          </div>

          <div className="mt-12 md:col-span-6 md:mt-0">
            {hasSteps ? (
              <div className="rounded-[2rem] bg-paper p-6 ring-1 ring-sage-line/70 shadow-[0_1px_2px_rgba(26,26,24,0.04),0_28px_70px_-38px_rgba(26,26,24,0.3)] sm:p-8 md:p-9">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-[1.6rem] leading-tight text-ink">{t('detail.steps')}</h3>
                  <span aria-hidden className="h-2.5 w-2.5 shrink-0 translate-y-[-2px] rotate-45 bg-gold-deep" />
                </div>
                <ol className="mt-6">
                  {steps.map((st, i) => (
                    <li key={st.title} className="flex gap-5 border-t border-rule py-5 first:border-t-0 first:pt-0 last:pb-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-deep font-mono text-[0.8rem] font-medium tabular-nums text-paper">
                        {i + 1}
                      </span>
                      <div className="pt-1">
                        <p className="font-serif text-[1.2rem] leading-[1.25] text-ink">{st.title}</p>
                        <p className="mt-1.5 max-w-[44ch] text-[15px] leading-relaxed text-ink-60">{st.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              offerList
            )}
          </div>
        </div>
      </SectionBody>
    </Section>
  );
}
