import { getTranslations } from 'next-intl/server';
import { Eyebrow, Section, SectionBody, SectionHeading } from './primitives';
import type { ServiceKey } from '@/lib/services';

/**
 * Two sections, stacked (client, 2026-09-28, on seeing the pilot live:
 * "Have one section page. And then one section points.").
 *
 * The second cut ran these side by side — prose on the start side, the
 * steps as a card on the end side. He wants them one after the other:
 * first the page's text, then the points. His vigsel reference is built
 * the same way (intro prose, then "Krav for nikah" as a numbered list).
 *
 * SECTION ONE — the text. One reading column: the offer heading, the
 * description that was written long ago and never rendered (longBody),
 * the offer lede, and the three offer points as a short ruled list. All
 * strings existed.
 *
 * SECTION TWO — the points. "Slik går det til", the steps in gold
 * numbered discs (his reference's shape), two to a row from md. Renders
 * nothing when items.<s>.steps is absent: no invented process.
 */
export async function ServiceOverview({ s }: { s: ServiceKey }) {
  const t = await getTranslations('servicesIndex');
  const offer = t.has(`items.${s}.offer`) ? (t.raw(`items.${s}.offer`) as { title: string; body?: string; detail?: string }[]) : [];
  const steps = t.has(`items.${s}.steps`) ? (t.raw(`items.${s}.steps`) as { title: string; body: string }[]) : [];
  const hasLong = t.has(`items.${s}.longBody`);
  const hasSteps = Array.isArray(steps) && steps.length > 0;

  return (
    <>
      <Section tone="paper">
        <SectionBody>
          <div className="max-w-[46rem]">
            <Eyebrow tone="gold-deep">{t('detail.about')}</Eyebrow>
            <h2 className="mt-5 font-serif text-section text-balance text-ink">{t(`items.${s}.offerTitle`)}</h2>
            {hasLong && <p className="mt-6 text-[clamp(1.0625rem,1.15vw,1.2rem)] leading-[1.6] text-ink">{t(`items.${s}.longBody`)}</p>}
            <p className="mt-4 text-body text-ink-60">{t(`items.${s}.offerLede`)}</p>

            {offer.length > 0 && (
              <div className="mt-10">
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
            )}
          </div>
        </SectionBody>
      </Section>

      {hasSteps && (
        <Section tone="paper-2">
          <SectionBody>
            <SectionHeading>{t('detail.steps')}</SectionHeading>
            <ol className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2 md:gap-y-10 lg:gap-x-16">
              {steps.map((st, i) => (
                <li key={st.title} className="flex gap-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-deep font-mono text-[0.85rem] font-medium tabular-nums text-paper">
                    {i + 1}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="font-serif text-[1.3rem] leading-[1.25] text-ink">{st.title}</h3>
                    <p className="mt-2 max-w-[46ch] text-body text-ink-60">{st.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </SectionBody>
        </Section>
      )}
    </>
  );
}
