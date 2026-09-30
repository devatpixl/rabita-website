import { getTranslations } from 'next-intl/server';
import { ServiceOverviewPhone } from './service-overview-phone';
import { Eyebrow, Section, SectionBody, SectionHeading } from './primitives';
import { MotionRise } from './motion-rise';
import type { ServiceKey } from '@/lib/services';

/**
 * Two sections, stacked (client, 2026-09-28, on seeing the pilot live:
 * "Have one section page. And then one section points."), set the way an
 * editorial site sets them rather than as a column and a grid.
 *
 * SECTION ONE — the text, as a split. The offer heading stands alone on
 * the start side at a larger size; the description that was written long
 * ago and never rendered (longBody) and the offer lede read on the end
 * side; the three offer points run as a row of three under a hairline
 * across the whole measure. One section, all of the page's text, and no
 * half-empty column — the first stacked cut left the end half of the
 * screen bare.
 *
 * SECTION TWO — the points. "Slik går det til" as a ruled list, one step
 * per row: the gold numbered disc his reference draws, the title, the
 * body beside it from md. A soft rise as it enters. Renders nothing
 * without items.<s>.steps.
 */
export async function ServiceOverview({ s }: { s: ServiceKey }) {
  const t = await getTranslations('servicesIndex');
  const offer = t.has(`items.${s}.offer`) ? (t.raw(`items.${s}.offer`) as { title: string; body?: string; detail?: string }[]) : [];
  const steps = t.has(`items.${s}.steps`) ? (t.raw(`items.${s}.steps`) as { title: string; body: string }[]) : [];
  const hasLong = t.has(`items.${s}.longBody`);
  const hasSteps = Array.isArray(steps) && steps.length > 0;

  return (
    <>
      {/* Phones get their own three sections — see
         components/service-overview-phone.tsx for what changes and why. The
         desktop markup below is unchanged and simply steps aside there. */}
      <ServiceOverviewPhone s={s} />

      <Section tone="paper" className="max-md:hidden md:py-section-lg">
        <SectionBody>
          {/* The full-measure ink rule that opened this section is gone
             (client, 2026-09-30: "remove this horizontal line ... make sure
             white so it looks good"). It drew a hard line straight under the
             hero's curve, which is two edges doing the same job in 60px, and
             the curve is the one he asked for. The padding stays, so nothing
             below it moves. */}
          <div className="pt-8 md:grid md:grid-cols-12 md:gap-12 md:pt-10 lg:gap-16">
            <div className="md:col-span-5">
              <Eyebrow tone="gold-deep">{t('detail.about')}</Eyebrow>
              <h2 className="mt-5 max-w-[14ch] font-serif text-[clamp(1.9rem,3.4vw,3rem)] leading-[1.08] tracking-[-0.015em] text-balance text-ink md:[font-variation-settings:'opsz'_144]">
                {t(`items.${s}.offerTitle`)}
              </h2>
            </div>
            <div className="mt-7 md:col-span-7 md:mt-0 md:pt-1">
              {hasLong && <p className="text-[clamp(1.0625rem,1.2vw,1.25rem)] leading-[1.6] text-ink">{t(`items.${s}.longBody`)}</p>}
              <p className="mt-5 max-w-[60ch] text-body text-ink-60">{t(`items.${s}.offerLede`)}</p>
            </div>
          </div>

          {offer.length > 0 && (
            <div className="mt-12 border-t border-rule pt-7 md:mt-16 md:pt-8">
              <Eyebrow tone="gold-deep">{t('detail.what')}</Eyebrow>
              <ul className="mt-5 grid gap-x-10 gap-y-5 sm:grid-cols-3">
                {offer.map((o) => (
                  <li key={o.title} className="flex gap-3.5">
                    <span aria-hidden className="mt-[0.6rem] block h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-deep" />
                    <div>
                      <p className="font-serif text-[1.2rem] leading-snug text-ink">{o.title}</p>
                      {o.body && <p className="mt-1 text-[15px] leading-relaxed text-ink-60">{o.body}</p>}
                      {o.detail && <p className="mt-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold-deep">{o.detail}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionBody>
      </Section>

      {hasSteps && (
        <Section tone="paper-2" className="max-md:hidden md:py-section-lg">
          <SectionBody>
            <SectionHeading>{t('detail.steps')}</SectionHeading>
            <MotionRise>
              {/* A LIST, not columns (client, 2026-09-28, pointing at the
                 offer row: "this maybe in points but in list order"). One
                 step per ruled row, the disc at the start, the title and
                 the body side by side from md so a row stays one line deep
                 where the text allows. */}
              <ol className="mt-10 border-t border-ink/20 md:mt-12">
                {steps.map((st, i) => (
                  <li key={st.title} className="flex gap-5 border-b border-rule py-6 md:gap-8 md:py-7">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-deep font-mono text-[0.85rem] font-medium tabular-nums text-paper">
                      {i + 1}
                    </span>
                    <div className="pt-1.5 md:grid md:flex-1 md:grid-cols-12 md:gap-8 md:pt-2">
                      <h3 className="font-serif text-[1.3rem] leading-[1.25] text-balance text-ink md:col-span-5 md:text-[1.4rem]">{st.title}</h3>
                      <p className="mt-2 max-w-[56ch] text-body text-ink-60 md:col-span-7 md:mt-0">{st.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </MotionRise>
          </SectionBody>
        </Section>
      )}
    </>
  );
}
