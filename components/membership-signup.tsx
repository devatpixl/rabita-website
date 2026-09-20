'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import Image from 'next/image';
import { Field, VALUE } from './request-form';
import { FigureIcon } from './figure-icons';

// The signup card. Same shape as the giving card in the hero — a bordered
// panel on the right of a dark split — because that pairing is the site's
// established conversion layout and a member is being asked for the same
// kind of commitment as a donor.
//
// One screen, no wizard. The strategy meeting's complaint about membership
// was that joining is too difficult; four fields and a button is the whole
// flow.
//
// NO TIERS SINCE 2026-09-16 (client: "make all memberships free, remove
// categories, all can vote"). Three tiles stood here — Ordinary 0 kr,
// Voting 1 000 kr, Under 15 0 kr — with the PAID one pre-selected, so the
// first thing anyone met on the join page was a 1 000 kr price tag on the
// default option. There is one membership now, it is free, and it carries a
// vote, so there is nothing to choose and the choice is gone.
//
// The panel, the plate and the field grid are untouched: the client asked
// for the shell to stay and the contents to change.

export function MembershipSignup() {
  // Ids for the shared Field wells: the label is a <label for>, so every
  // control needs one that is unique on the page.
  const uid = useId();
  const t = useTranslations('medlemskapPage');
  const tj = useTranslations('joinPage');
  // Not a tier — a legal flag. Guardian consent for a minor is required
  // whatever the membership costs, so it outlived the tiers as a checkbox.
  const [under15, setUnder15] = useState(false);
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
        body: JSON.stringify({ under15, name, email, phone, guardianName, guardianPhone }),
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
          {/* Client, Tekst (endelig) Sept 2026 — the signup section reads
             eyebrow "Bli medlem" / heading "Ett skjema. Ett minutt." / a
             sentence. The heading was medlemskapPage.choose, which is also
             the SUBMIT BUTTON's label, so the panel said "Bli medlem" twice
             under an eyebrow that said it a third time. */}
          <h2 className="mt-3 font-serif text-[clamp(1.35rem,2.4vw,1.75rem)] leading-tight text-ink">
            {tj('formLede')}
          </h2>
          <p className="mt-1.5 text-[15px] text-ink-60">{tj('formBody')}</p>

          {/* What the three tiles used to occupy: one sentence saying the
             thing they were there to let you choose between. Ruled top and
             bottom so it reads as a statement of terms rather than a caption,
             and set in the panel's own voice — no badge, no box, nothing that
             looks like a control, because there is nothing here to pick. */}
          <p className="mt-6 flex items-start gap-3 border-y border-gold-deep/15 py-4 text-[14px] leading-snug text-ink">
            <span
              aria-hidden
              className="mt-px grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold-deep/15 text-gold-deep"
            >
              <FigureIcon name="check" className="h-[14px] w-[14px]" />
            </span>
            {tj('freeNote')}
          </p>

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
            {under15 && (
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

          {/* The one thing left that changes the form. A checkbox, not a
             tile: it is a fact about the member, not a product. */}
          <label className="mt-4 flex cursor-pointer items-center gap-3 text-[13.5px] text-ink">
            <input
              type="checkbox"
              checked={under15}
              onChange={(e) => setUnder15(e.target.checked)}
              className="h-4 w-4 shrink-0 rounded-[3px] border-ink/25 accent-gold-deep"
            />
            {t('form.under15')}
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="group mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-gold-deep px-5 text-[15px] font-semibold text-paper transition-colors hover:bg-ink active:scale-[0.99] disabled:opacity-50"
          >
            {t('form.submitFree')}
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
             a TALL slice of it, 360x806, not the near-square crop that was
             here: at 205x270 in a 192x510 column the picture had to scale
             1.9x and lose its sides, which is why it read as a blown-up
             window. At 0.45 against the column's 0.38 it barely crops, and
             360 source pixels across a 192px column stays sharp on a retina
             screen. */}
          <Image
            src="/photos/membership-interior.webp"
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 1024px) 12rem, 0px"
            className="object-cover object-center"
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
