'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import Image from 'next/image';
import { Field, VALUE } from './request-form';
import { FigureIcon, type FigureIconName } from './figure-icons';

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

// A mark per tier, so the three read as three kinds of thing rather than
// three prices. check for the vote, because that is what the vote IS.
const TIER_ICONS: Record<Tier, FigureIconName> = {
  ordinary: 'person',
  voting: 'check',
  youth: 'people',
};

export function MembershipSignup() {
  // Ids for the shared Field wells: the label is a <label for>, so every
  // control needs one that is unique on the page.
  const uid = useId();
  const t = useTranslations('medlemskapPage');
  const tj = useTranslations('joinPage');
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
      <div className="rounded-[1.75rem] bg-paper/85 p-10 text-center ring-1 ring-gold-deep/15 backdrop-blur-sm">
        <p className="font-serif text-[1.5rem] text-ink">{t('done.title')}</p>
        <p className="mt-3 text-body text-ink-60">{t('done.body')}</p>
      </div>
    );
  }

  return (
    /* ONE panel, holding the form and a plate of the building, rather than a
       card with a shadow under it. The reference's shape (client,
       2026-09-13): no inner boxes, no stacked cards — the panel is the only
       edge, and everything inside it is separated by rules and space.
       bg-paper/85 with a blur so the texture and the wash behind the section
       carry faintly through it, which is what keeps it from reading as a
       white rectangle dropped on a photograph. */
    <div className="overflow-hidden rounded-[1.75rem] bg-paper/85 ring-1 ring-gold-deep/12 shadow-[0_1px_2px_rgba(26,26,24,0.03),0_30px_80px_-50px_rgba(26,26,24,0.28)] backdrop-blur-sm">
      {/* The plate takes a FIXED measure, not a fraction. At 1fr of a
           1.45/1 split the form came out 367px wide inside a 621px panel,
           which left each of the three tiles 94px — "Voting" wrapped under
           its own badge. A fixed 12rem gives the form everything else, and
           the tiles land near 147px, which is where "Under 15" stops
           wrapping onto a second line. */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_12rem]">
        <form onSubmit={onSubmit} className="p-6 text-ink sm:p-8">
          <p className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold-deep">
            <span aria-hidden className="h-px w-5 shrink-0 bg-gold-deep/50" />
            {tj('formEyebrow')}
          </p>
          <h2 className="mt-3 font-serif text-[clamp(1.35rem,2.4vw,1.75rem)] leading-tight text-ink">
            {t('choose')}
          </h2>
          <p className="mt-1.5 text-[15px] text-ink-60">{tj('formLede')}</p>

          <fieldset className="mt-6 border-0 p-0">
            <legend className="sr-only">{t('choose')}</legend>
            {/* Three across from sm, stacked below. Each is a whole tile the
               reader can hit, not a radio with a label beside it. */}
            <div className="grid gap-2.5 sm:grid-cols-3">
              {TIERS.map((k) => {
                const on = tier === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setTier(k)}
                    aria-pressed={on}
                    className={cn(
                      'group relative rounded-2xl border px-3.5 py-3.5 text-start transition-all duration-200',
                      // Both branches name a text colour. Keeping them
                      // symmetric is what stops the inherited-paper-on-paper
                      // bug returning.
                      on
                        ? 'border-gold-deep bg-gold-deep/[0.07] text-ink shadow-[0_1px_0_rgba(155,127,74,0.25)]'
                        : 'border-ink/10 bg-paper/70 text-ink hover:border-gold-deep/40 hover:bg-paper',
                    )}
                  >
                    {/* pe-7 reserves the badge's corner. Without it the
                       longest name runs under the tick. */}
                    <span className="flex items-center gap-2 pe-6">
                      <span
                        aria-hidden
                        className={cn(
                          'grid h-6 w-6 shrink-0 place-items-center rounded-full transition-colors',
                          on ? 'bg-gold-deep/15 text-gold-deep' : 'bg-ink/[0.05] text-ink-60 group-hover:text-gold-deep',
                        )}
                      >
                        <FigureIcon name={TIER_ICONS[k]} className="h-[14px] w-[14px]" />
                      </span>
                      <span className="block min-w-0 text-[13.5px] font-semibold leading-tight">
                        {t(`tiers.${k}.name`)}
                      </span>
                    </span>
                    <span className="mt-2.5 block font-serif text-[1.05rem] tabular-nums text-ink">
                      {t(`tiers.${k}.price`)}
                    </span>
                    <span className="mt-1 block text-[12px] leading-snug text-ink-60">
                      {t(`tiers.${k}.body`)}
                    </span>
                    {/* The tick, only on the chosen one. aria-pressed already
                       says it; this is the visual half. */}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute end-3 top-3 grid h-[18px] w-[18px] place-items-center rounded-full bg-gold-deep text-paper transition-all duration-200',
                        on ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
                      )}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <h3 className="mt-8 font-serif text-[1.15rem] text-ink">{t('form.heading')}</h3>
          {/* Two up from sm, which is the reference's grid and also the
             shape autofill expects: name beside email, phone beside the
             rest. */}
          <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
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
               different pieces of data in a single box: nothing could
               validate it, autofill could not help, and whatever arrived had
               to be unpicked by hand at the other end. For a member under 15
               the guardian's phone is the only number that is any use, so
               both are required rather than optional. */}
            {tier === 'youth' && (
              <>
                <Field id={`${uid}-guardianName`} label={t('form.guardianName')} icon="person" tone="paper" card>
                  <input
                    id={`${uid}-guardianName`}
                    required
                    autoComplete="off"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className={field}
                  />
                </Field>
                <Field id={`${uid}-guardianPhone`} label={t('form.guardianPhone')} icon="phone" tone="paper" card>
                  <input
                    id={`${uid}-guardianPhone`}
                    required
                    type="tel"
                    autoComplete="off"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className={field}
                  />
                </Field>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-gold-deep px-5 text-[15px] font-semibold text-paper transition-colors hover:bg-ink active:scale-[0.99] disabled:opacity-50"
          >
            {tier === 'voting' ? t('form.submitPay') : t('form.submitFree')}
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
              &rarr;
            </span>
          </button>

          <p className="mt-3.5 text-[12px] leading-snug text-ink-60">{t('form.note')}</p>
        </form>

        {/* The plate. Inside the panel, not beside it, so the panel stays one
           object. Hidden below lg: at tablet width it would either squeeze
           the form into a column too narrow for two fields, or sit under it
           as a banner nobody asked for. */}
        <div className="relative hidden lg:block">
          {/* The client's mosque interior. 255x472, so it is given a column
             narrower than that rather than a wide one: at 12rem it is never
             asked to cover more pixels than it has on a 1x screen. object-
             cover with a fixed anchor, so it crops at every height instead
             of stretching. */}
          <Image
            src="/photos/membership-interior.webp"
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 1024px) 12rem, 0px"
            className="object-cover object-[55%_45%]"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(22,36,46,0) 38%, rgba(22,36,46,0.55) 72%, rgba(22,36,46,0.88) 100%)',
            }}
          />
          <p className="absolute inset-x-0 bottom-0 p-6">
            <span aria-hidden className="mb-3 block h-px w-8 bg-gold/70" />
            <span className="block max-w-[22ch] font-serif text-[1.15rem] italic leading-snug text-paper">
              {tj('imageCaption')}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
