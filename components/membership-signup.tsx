'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { Field, VALUE } from './request-form';

// The signup card. Same shape as the giving card in the hero — a bordered
// panel on the right of a dark split — because that pairing is the site's
// established conversion layout and a member is being asked for the same
// kind of commitment as a donor.
//
// One screen, no wizard. The strategy meeting's complaint about membership
// was that joining is too difficult; a tier, four fields and a button is
// the whole flow.

type Tier = 'ordinary' | 'voting' | 'youth';
const TIERS: Tier[] = ['ordinary', 'voting', 'youth'];

export function MembershipSignup() {
  // Ids for the shared Field wells: the label is a <label for>, so every
  // control needs one that is unique on the page.
  const uid = useId();
  const t = useTranslations('medlemskapPage');
  const [tier, setTier] = useState<Tier>('voting');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/memberships', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tier, name, email, phone, guardianName, guardianPhone }),
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  // A WELL, matching request-form's fields: filled a shade DARKER than the
  // panel it sits on, inside a 1.5px box. It used to be bg-paper on a
  // bg-paper card, which was invisible the moment this card stopped standing
  // on the dusk section and moved onto paper-2 (2026-09-08) — the same
  // "fields do not look like fields" the enquiry form was corrected for.
  // The value styling request-form's paper tone puts on its own inputs. Its
  // TONE map is private, and paper is the only ground this form stands on.
  const field = cn(VALUE, 'text-ink caret-gold-deep placeholder:text-ink-40');

  if (done) {
    return (
      <div className="rounded-[2rem] bg-paper p-8 text-center ring-1 ring-sage-line/70">
        <p className="font-serif text-[1.4rem] text-ink">{t('done.title')}</p>
        <p className="mt-3 text-body text-ink-60">{t('done.body')}</p>
      </div>
    );
  }

  return (
    <div className="relative isolate">
      {/* The offset plate behind the card, same device the giving card uses,
         so the two asks on this site look like siblings. */}
      <div
        aria-hidden
        className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl border-t border-gold/40 bg-paper-deep"
      />
      {/* text-ink on the form, not just on individual children. The card is a
         paper panel dropped inside a `bg-dusk text-paper` section, so any
         descendant that doesn't name its own colour inherits near-white and
         disappears against the card. That is exactly what happened to the
         selected tier tile: its branch of the ternary set a border and a
         background but no text colour, so the label and price went blank the
         moment you picked one. */}
      <form
        onSubmit={onSubmit}
        className="relative rounded-[2rem] bg-paper p-6 text-ink ring-1 ring-sage-line/70 shadow-[0_1px_2px_rgba(26,26,24,0.04),0_28px_70px_-38px_rgba(26,26,24,0.3)] sm:p-8"
      >
        <fieldset className="border-0 p-0">
          <legend className="font-serif text-card text-ink">{t('choose')}</legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {TIERS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setTier(k)}
                aria-pressed={tier === k}
                className={cn(
                  'rounded-2xl border-[1.5px] px-2 py-3 text-center transition-colors',
                  // Both branches name a text colour. Keeping them symmetric
                  // is what stops the inherited-paper-on-paper bug returning.
                  //
                  // Same sage well as the fields below, so the chips read as
                  // the first question of one form rather than as a separate
                  // control strip. Selected takes the gold border the wells
                  // take on focus.
                  tier === k
                    ? 'border-gold-deep bg-paper text-ink'
                    : 'border-sage-line bg-sage-soft text-ink-60 hover:border-gold-deep/45 hover:text-ink',
                )}
              >
                <span className="block text-[13px] font-semibold">{t(`tiers.${k}.name`)}</span>
                <span className="mt-0.5 block font-serif text-[1rem] tabular-nums">
                  {t(`tiers.${k}.price`)}
                </span>
              </button>
            ))}
          </div>
          {/* One line per tier, deliberately. These used to be full
             sentences that wrapped to two lines on every tier except
             Ordinary, so the card changed height under the reader's cursor
             as they compared options. The long versions are not lost — they
             are still what "The three memberships" prints further down the
             page, in a column wide enough for them. */}
          <p className="mt-2.5 border-s-2 border-gold ps-3 text-[0.9rem] leading-snug text-ink-60">
            {t(`tiers.${tier}.body`)}
          </p>
        </fieldset>

        <div className="mt-5 space-y-2.5 border-t border-rule pt-5">
          <Field id={`${uid}-name`} label={t('form.name')} icon="person" tone="paper" card>
            <input id={`${uid}-name`} required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
          </Field>
          <Field id={`${uid}-email`} label={t('form.email')} icon="mail" tone="paper" card>
            <input id={`${uid}-email`} required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          </Field>
          <Field id={`${uid}-phone`} label={t('form.phone')} icon="phone" tone="paper" card>
            <input id={`${uid}-phone`} type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
          </Field>
          {/* Two fields, not one. "Guardian (name and phone)" asked for two
             different pieces of data in a single box: nothing could validate
             it, autofill could not help, and whatever arrived had to be
             unpicked by hand at the other end. For a member under 15 the
             guardian's phone is the only number that is any use, so both are
             required rather than optional. */}
          {tier === 'youth' && (
            <div className="grid gap-2.5 sm:grid-cols-2">
              <Field id={`${uid}-guardianName`} label={t('form.guardianName')} icon="person" tone="paper" card>
                <input
                  required
                  autoComplete="off"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className={field}
                />
              </Field>
              <Field id={`${uid}-guardianPhone`} label={t('form.guardianPhone')} icon="phone" tone="paper" card>
                <input
                  required
                  type="tel"
                  autoComplete="off"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className={field}
                />
              </Field>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 min-h-12 w-full rounded-full bg-gold-deep px-5 text-[15px] font-semibold text-paper transition-colors hover:bg-ink active:scale-[0.99] disabled:opacity-50"
        >
          {tier === 'voting' ? t('form.submitPay') : t('form.submitFree')}
        </button>

        <p className="mt-3 text-[12px] leading-snug text-ink-60">{t('form.note')}</p>
      </form>
    </div>
  );
}
