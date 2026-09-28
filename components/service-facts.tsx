import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/cn';
import { CAMPAIGN } from '@/lib/campaign';
import { VISIT } from '@/lib/location';
import { SERVICE_CONTACT, type ServiceKey } from '@/lib/services';

/**
 * The practical strip (pilot, 2026-09-28): e-mail · phone (when a service
 * has one) · address · office hours · any locale rows from
 * items.<s>.facts. The 09-15 request took the phone and the address off
 * the service pages; the reference the client now points to prints a
 * contact card and the address on the same screen as the words, so they
 * come back here, as a ruled row along the foot of the hero.
 *
 * Rows, not cards: the reference's two tiles ("Gebyr via Vipps",
 * "Adresse") are the same information, and a row of mono labels over
 * serif values is what the footer and the visit page already do with
 * exactly these facts. A fee column appears the day the client sends one.
 *
 * tone="dusk" is for the hero; "paper" is kept for the day the strip is
 * wanted on a light ground.
 */
export async function ServiceFacts({
  s,
  tone = 'paper',
  className,
}: {
  s: ServiceKey;
  tone?: 'paper' | 'dusk';
  className?: string;
}) {
  const t = await getTranslations('servicesIndex');
  const tf = await getTranslations('footer.findUs');
  const contact = SERVICE_CONTACT[s];
  const email = contact?.email ?? CAMPAIGN.contactEmail;
  const phone = contact?.phone;
  const local = t.has(`items.${s}.facts`) ? (t.raw(`items.${s}.facts`) as { label: string; value: string }[]) : [];

  const rows: { label: string; value: string; href?: string }[] = [
    { label: tf('email'), value: email, href: `mailto:${email}` },
    ...(phone ? [{ label: tf('phone'), value: phone, href: `tel:${phone.replace(/\s+/g, '')}` }] : []),
    { label: tf('address'), value: VISIT.address },
    { label: tf('office'), value: tf('officeHours') },
    ...(Array.isArray(local) ? local : []),
  ];

  const dusk = tone === 'dusk';

  return (
    <dl
      className={cn(
        'grid gap-x-8 gap-y-5 border-t pt-6 sm:grid-cols-2 md:flex md:flex-wrap md:gap-x-12',
        dusk ? 'border-paper/25' : 'border-ink/20',
        className,
      )}
    >
      {rows.map((r) => (
        <div key={r.label} className="min-w-0">
          <dt className={cn('font-mono text-[0.625rem] uppercase tracking-[0.18em]', dusk ? 'text-gold' : 'text-ink-60')}>
            {r.label}
          </dt>
          <dd className={cn('mt-1.5 font-serif text-[1.1rem] leading-snug', dusk ? 'text-paper' : 'text-ink')}>
            {r.href ? (
              <a
                href={r.href}
                className={cn(
                  'underline underline-offset-4 transition-colors',
                  dusk ? 'decoration-gold/60 hover:text-gold' : 'decoration-gold hover:text-gold-deep',
                )}
              >
                {r.value}
              </a>
            ) : (
              r.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
