import { getTranslations } from 'next-intl/server';
import { Section, SectionBody, SectionHeading } from './primitives';
import type { ServiceKey } from '@/lib/services';

/**
 * "Slik går det til" — the sequence, where a service has one (pilot,
 * 2026-09-28). Renders NOTHING when items.<s>.steps is absent: a service
 * with no process gets no invented process. Nikah's four steps come from
 * rabita.no/nikah (Skatteetaten → civil wedding → book → ceremony) and
 * from the page's own longBody; the second step carries a fact the client
 * must confirm — "Rabita har per i dag ikke vigselsrett" is what rabita.no
 * says today.
 *
 * Four columns from md, each opened by an ink rule with the number on it.
 * Typography only — no discs, no icons, no connector arrows. The reference
 * uses green numbered circles; the site's own device for a sequence is the
 * ruled column (floor-story, phase-tasks), so that is what this is.
 */
export async function ServiceSteps({ s }: { s: ServiceKey }) {
  const t = await getTranslations('servicesIndex');
  if (!t.has(`items.${s}.steps`)) return null;
  const steps = t.raw(`items.${s}.steps`) as { title: string; body: string }[];
  if (!Array.isArray(steps) || steps.length === 0) return null;

  return (
    <Section tone="paper">
      <SectionBody>
        <SectionHeading>{t('detail.steps')}</SectionHeading>
        <ol className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-2 md:grid-cols-4 md:gap-x-10">
          {steps.map((st, i) => (
            <li key={st.title} className="border-t border-ink pt-5">
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] tabular-nums text-gold-deep">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-serif text-[1.25rem] leading-[1.25] text-balance text-ink">{st.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink-60">{st.body}</p>
            </li>
          ))}
        </ol>
      </SectionBody>
    </Section>
  );
}
