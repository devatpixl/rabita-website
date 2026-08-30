import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { Section, SectionBody } from './primitives';
import { Accent } from './accent';

// Every service Rabita offers, as boxes rather than a register of rows.
//
// Eleven services listed one under another read as a wall of text — the
// client's word was "rotete". Grouped into four families, each box carrying
// only a name and one short line, the same list becomes something you scan.
// The detail lives on each service's own page, which is where somebody who
// has picked one actually wants it.
const GROUPS = [
  { key: 'religious', items: ['nikah', 'janaza', 'shahada', 'hajj-umrah'] },
  { key: 'guidance', items: ['counselling', 'megling'] },
  { key: 'teaching', items: ['skole', 'koran', 'kurs'] },
  { key: 'community', items: ['barn-og-ungdom', 'veivisere'] },
] as const;

export async function ServiceIndex() {
  const l = await getLocale();
  const t = await getTranslations('servicesIndex');

  return (
    <Section tone="paper">
      <SectionBody>
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
          {t('allEyebrow')}
        </p>
        <h2 className="mt-4 max-w-2xl font-serif text-section text-balance text-ink">
          {t.rich('allHeading', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
        </h2>

        <div className="mt-12 space-y-12">
          {GROUPS.map((g) => (
            <div key={g.key}>
              <h3 className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-60">
                {t(`groups.${g.key}`)}
              </h3>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {g.items.map((k) => (
                  <li key={k}>
                    <Link
                      href={`/${l}/tjenester/${k}`}
                      className="group flex h-full flex-col border-t border-rule bg-paper-2 p-5 transition-colors duration-200 hover:border-gold-deep hover:bg-paper-deep"
                    >
                      <span className="font-serif text-card leading-tight text-ink">
                        {t(`items.${k}.title`)}
                      </span>
                      <span className="mt-2 text-[14px] leading-relaxed text-ink-60">
                        {t(`items.${k}.body`)}
                      </span>
                      <span
                        aria-hidden
                        className="mt-auto pt-5 text-ink-60 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gold-deep rtl:rotate-180 rtl:group-hover:-translate-x-1"
                      >
                        &rarr;
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionBody>
    </Section>
  );
}
