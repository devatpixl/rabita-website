import { getTranslations } from 'next-intl/server';
import { Eyebrow, Section, SectionBody } from './primitives';
import type { ServiceKey } from '@/lib/services';

/**
 * What the service is, and what Rabita does — the section the page never
 * had (pilot, 2026-09-28).
 *
 * THE COPY WAS ALREADY WRITTEN. items.<s>.longBody (a real paragraph about
 * the service, 140–350 characters, three locales) and items.<s>.offer (the
 * three things Rabita does, three locales) have been in the message files
 * since the services were first written, and rendered nowhere: the 09-05
 * trim dropped the section that printed them, and the 09-23 merge did not
 * bring it back. This puts both on the page, under the offer heading and
 * lede that the opener used to carry.
 *
 * Shape: the heading and the two paragraphs in the start column, the offer
 * as a numbered register in the end column — the islamic.no "Krav for
 * nikah" beat, done as rows in the site's own row language rather than
 * numbered discs.
 *
 * kurs-konvertitter's offer rows carry body and detail as well; both print
 * when present, so that page needs no special case when it joins.
 */
export async function ServiceOverview({ s }: { s: ServiceKey }) {
  const t = await getTranslations('servicesIndex');
  const offer = (t.has(`items.${s}.offer`) ? (t.raw(`items.${s}.offer`) as { title: string; body?: string; detail?: string }[]) : []) ?? [];
  const hasLong = t.has(`items.${s}.longBody`);

  return (
    <Section tone="paper-2">
      <SectionBody>
        <div className="md:grid md:grid-cols-12 md:gap-12 lg:gap-16">
          <div className="md:col-span-5">
            <Eyebrow tone="gold-deep">{t('detail.about')}</Eyebrow>
            <h2 className="mt-5 font-serif text-section text-balance text-ink">{t(`items.${s}.offerTitle`)}</h2>
            {hasLong && <p className="mt-6 max-w-prose text-body text-ink">{t(`items.${s}.longBody`)}</p>}
            <p className="mt-4 max-w-prose text-body text-ink-60">{t(`items.${s}.offerLede`)}</p>
          </div>

          {offer.length > 0 && (
            <div className="mt-12 md:col-span-6 md:col-start-7 md:mt-0">
              <Eyebrow tone="gold-deep">{t('detail.what')}</Eyebrow>
              <ol className="mt-5 border-t border-ink/20">
                {offer.map((o, i) => (
                  <li key={o.title} className="grid grid-cols-[2.75rem_1fr] gap-x-4 border-b border-rule py-5">
                    <span className="pt-1 font-mono text-[0.6875rem] uppercase tracking-[0.18em] tabular-nums text-gold-deep">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="font-serif text-[1.2rem] leading-[1.3] text-ink">{o.title}</p>
                      {o.body && <p className="mt-1.5 max-w-[46ch] text-[15px] leading-relaxed text-ink-60">{o.body}</p>}
                      {o.detail && (
                        <p className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold-deep">{o.detail}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </SectionBody>
    </Section>
  );
}
