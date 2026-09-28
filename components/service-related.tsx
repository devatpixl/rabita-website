import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Accent } from './accent';
import { Section, SectionBody, SectionHeading } from './primitives';
import { SERVICE_FOCUS, SERVICE_GROUPS, SERVICE_IMAGE, SERVICE_KEYS, type ServiceKey } from '@/lib/services';

const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

/**
 * "Andre tjenester" — three from the same family, after the form (pilot,
 * 2026-09-28). Before this, the page ended on the form and the footer;
 * someone who had come to the wrong service had the browser's back button
 * and nothing else. Three cards is one row and no carousel.
 *
 * Same family first (SERVICE_GROUPS), then the site's own order to make up
 * three — counselling is alone in its group and would otherwise show none.
 * Titles go through t.rich so the gold italic carries over; the one-line
 * body is items.<k>.body, which the index cards already print.
 */
export async function ServiceRelated({ s, locale }: { s: ServiceKey; locale: string }) {
  const t = await getTranslations('servicesIndex');
  const tnav = await getTranslations('nav');

  const family = SERVICE_GROUPS.find((g) => (g.items as readonly ServiceKey[]).includes(s))?.items ?? [];
  const picked: ServiceKey[] = [];
  for (const k of [...family, ...SERVICE_KEYS]) {
    if (k !== s && !picked.includes(k)) picked.push(k);
    if (picked.length === 3) break;
  }

  return (
    <Section tone="paper-2">
      <SectionBody>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <SectionHeading>{t('detail.related')}</SectionHeading>
          <Link
            href={`/${locale}/tjenester`}
            className="group inline-flex min-h-11 items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold-deep transition-colors hover:text-ink"
          >
            {tnav('items.services')}
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">&rarr;</span>
          </Link>
        </div>
        <ul className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-8">
          {picked.map((k) => (
            <li key={k}>
              <Link href={`/${locale}/tjenester/${k}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-paper-deep [transform:translateZ(0)]">
                  <Image
                    src={SERVICE_IMAGE[k]}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 30vw, 92vw"
                    style={{ filter: GRADE, objectPosition: SERVICE_FOCUS[k] ?? '50% 50%' }}
                    className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="mt-5 font-serif text-[1.3rem] leading-[1.25] text-ink">
                  {t.rich(`items.${k}.title`, { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-60">{t(`items.${k}.body`)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </SectionBody>
    </Section>
  );
}
