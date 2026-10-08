import { getTranslations } from 'next-intl/server';
import { ServiceOverviewPhone } from './service-overview-phone';
import { Eyebrow, Section, SectionBody, SectionHeading } from './primitives';
import { MotionRise } from './motion-rise';
import { cn } from '@/lib/cn';
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
              {/* COLUMNS DIVIDED BY HAIRLINES, each opened by the numbered
                 disc — the shape this page had at cc0c626 and which the
                 client asked for again on 2026-10-08, sending a screenshot of
                 that pilot beside the list that replaced it.

                 THE LIST WAS ALSO HIS. On 2026-09-28, pointing at the offer
                 row, he asked for "points but in list order", and the ruled
                 list is what that produced. Both are recorded here because
                 the next person to read this will otherwise undo one of them
                 believing it was never asked for.

                 What makes the columns work now and not then: the step bodies
                 were cut by a third on 2026-10-08. The screenshot he sent
                 shows the OLD text in these columns — four lines in a 230px
                 measure, which is what made them look cramped. At 45
                 characters they sit in two.

                 Column count follows step count. Four of the eighteen
                 services have four steps and the rest have three; a hardcoded
                 grid-cols-4 leaves a fourteen-page hole where the fourth
                 column should be. Both classes are spelled out in full
                 because Tailwind scans source text and would never generate
                 a template-built one. */}
              <ol
                className={cn(
                  'mt-10 grid gap-y-8 md:mt-12 md:gap-y-0',
                  steps.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3',
                )}
              >
                {steps.map((st, i) => (
                  <li
                    key={st.title}
                    className="md:border-s md:border-ink/15 md:px-7 md:first:border-s-0 md:first:ps-0 lg:px-9 lg:first:ps-0"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-deep font-mono text-[0.85rem] font-medium tabular-nums text-paper">
                      {i + 1}
                    </span>
                    <h3 className="mt-7 font-serif text-[1.3rem] leading-[1.25] text-balance text-ink">{st.title}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink-60">{st.body}</p>
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
