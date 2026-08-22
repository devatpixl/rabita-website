'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

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

  const field =
    'min-h-11 w-full rounded-btn border border-rule bg-paper px-3.5 py-2 text-body text-ink outline-none transition-colors placeholder:text-ink-40 focus:border-ink';

  if (done) {
    return (
      <div className="rounded-2xl border border-gold/30 bg-paper p-8 text-center">
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
        className="relative rounded-2xl border border-gold/30 bg-paper p-6 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06),0_28px_60px_-24px_rgba(0,0,0,0.4)] md:p-7"
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
                  'rounded-chip px-2 py-2.5 text-center transition-colors',
                  // Both branches name a text colour. Keeping them symmetric
                  // is what stops the inherited-paper-on-paper bug returning.
                  tier === k
                    ? 'border-[1.5px] border-ink bg-paper text-ink'
                    : 'border border-rule text-ink-60 hover:border-ink hover:text-ink',
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
          <label className="block">
            <span className="mb-1 block text-[13px] text-ink-60">{t('form.name')}</span>
            <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] text-ink-60">{t('form.email')}</span>
            <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] text-ink-60">{t('form.phone')}</span>
            <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
          </label>
          {/* Two fields, not one. "Guardian (name and phone)" asked for two
             different pieces of data in a single box: nothing could validate
             it, autofill could not help, and whatever arrived had to be
             unpicked by hand at the other end. For a member under 15 the
             guardian's phone is the only number that is any use, so both are
             required rather than optional. */}
          {tier === 'youth' && (
            <div className="grid gap-2.5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[13px] text-ink-60">{t('form.guardianName')}</span>
                <input
                  required
                  autoComplete="off"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className={field}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[13px] text-ink-60">{t('form.guardianPhone')}</span>
                <input
                  required
                  type="tel"
                  autoComplete="off"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className={field}
                />
              </label>
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
