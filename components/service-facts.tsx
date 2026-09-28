import { getTranslations } from 'next-intl/server';
import { Eyebrow } from './primitives';
import { cn } from '@/lib/cn';
import { CAMPAIGN } from '@/lib/campaign';
import { VISIT } from '@/lib/location';
import { SERVICE_CONTACT, type ServiceKey } from '@/lib/services';

/**
 * "Praktisk" — the register beside the enquiry form (pilot, 2026-09-28).
 *
 * The 09-15 request took the phone, the address and the e-mail off the
 * service pages; the reference the client now points to prints a contact
 * card, a fee strip and the address on the same page as the form. This
 * puts the facts back, in the slot the "Bli medlem" aside had, so the
 * form's neighbour is information rather than a second offer.
 *
 * Rows, in order: e-mail (per service, else the front desk) · phone (only
 * when a service has one) · address (lib/location VISIT — where the
 * congregation is, not the plot) · office hours (the footer's own string)
 * · then any locale rows from items.<s>.facts, such as nikah's
 * "Forutsetning". A row with no value is not rendered; a fee row will
 * appear the day the client sends one.
 */
export async function ServiceFacts({ s, className }: { s: ServiceKey; className?: string }) {
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

  return (
    <aside className={className}>
      <Eyebrow tone="gold-deep">{t('detail.facts')}</Eyebrow>
      <dl className="mt-5 border-t border-ink/20">
        {rows.map((r) => (
          <div key={r.label} className="border-b border-rule py-4">
            <dt className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-60">{r.label}</dt>
            <dd className={cn('mt-1.5 font-serif text-[1.15rem] leading-snug text-ink', r.href && 'break-all')}>
              {r.href ? (
                <a href={r.href} className="underline decoration-gold underline-offset-4 transition-colors hover:text-gold-deep">
                  {r.value}
                </a>
              ) : (
                r.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
