import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { IMAMS } from '@/lib/imams';
import { Accent } from './accent';
import { SectionBody } from './primitives';

// The imams, as three portraits on one rule. The theological leader comes
// first and carries a gold ring; the two imams follow. Each card is a
// portrait (monogram until a photograph is supplied), name in serif, role
// in gold mono, two lines of who they are, and the languages they take a
// conversation in — the detail a first-time visitor actually needs.
export async function Imams() {
  const t = await getTranslations('imams');
  return (
    <section id="imamene" className="scroll-mt-24 bg-paper-2 py-section-md">
      <SectionBody>
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">{t('eyebrow')}</p>
        <h2 className="mt-4 max-w-2xl font-serif text-section text-balance text-ink">
          {t.rich('heading', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
        </h2>
        <p className="mt-4 max-w-prose text-body text-ink-60">{t('lede')}</p>

        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {IMAMS.map((im, i) => {
            const lead = i === 0;
            const initials = im.name.split(' ').map((w) => w[0]).join('');
            return (
              <li
                key={im.key}
                className="group relative flex flex-col border-t border-rule bg-paper p-5 transition-colors duration-200 hover:border-gold-deep md:p-6"
              >
                {/* The portrait carries the card: 112px, so a face is a face
                   and not a thumbnail. The spacing around it is trimmed to
                   match, so the card keeps its height. */}
                <div className="flex items-center gap-4">
                  <span
                    className={`relative grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-full bg-paper-2 ${
                      lead ? 'ring-2 ring-gold-deep ring-offset-[3px] ring-offset-paper' : 'ring-1 ring-rule ring-offset-[3px] ring-offset-paper'
                    }`}
                  >
                    {im.photo ? (
                      <Image src={im.photo} alt={im.name} fill sizes="112px" className="object-cover" />
                    ) : (
                      <span className="font-serif text-[1.75rem] text-ink-60" aria-hidden>
                        {initials}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-gold-deep">{t(`people.${im.key}.role`)}</p>
                    <h3 className="mt-1.5 font-serif text-[1.35rem] leading-tight text-ink">{im.name}</h3>
                  </div>
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-ink-60">{t(`people.${im.key}.bio`)}</p>
                <p className="mt-auto pt-4 font-mono text-[0.625rem] uppercase leading-relaxed tracking-[0.14em] text-ink-60">
                  {t('languages')} · <span className="text-ink">{im.languages.join(' · ')}</span>
                </p>
              </li>
            );
          })}
        </ul>
      </SectionBody>
    </section>
  );
}
