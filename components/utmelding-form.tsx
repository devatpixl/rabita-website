'use client';

import { useId, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { CAMPAIGN } from '@/lib/campaign';
import { Field, VALUE } from './request-form';

// The resignation form, from the client's own mock (2026-09-18): first and
// last name, the e-mail used at signup, phone and reason optional, an
// under-15 flag, one button. It is the sign-up card's sibling — same wells,
// same button — because leaving should not be made to feel harder than
// joining. His brief for the page was iman.no's "but not so stimulating",
// and a form that fights the reader would be exactly that.
//
// WHAT HAPPENS ON SUBMIT. POST /api/utmelding, which mails
// medlemskap@rabita.no through Resend. Until the mail key exists on Vercel
// that route answers 503, and this form then opens a prefilled draft to the
// same address in the visitor's own mail client — the same fallback the
// contact panel uses. Either way the resignation reaches the office; what
// the form never does is say thank you over a request that went nowhere.
//
// noValidate: the wells draw their own invalid state, so the browser's
// bubbles are turned off and the one required-fields message is ours.
export function UtmeldingForm() {
  const uid = useId();
  const t = useTranslations('utmeldingPage.form');
  const td = useTranslations('utmeldingPage.done');
  const locale = useLocale();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [child, setChild] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<'required' | 'network' | null>(null);

  const field = cn(VALUE, 'text-ink caret-gold-deep placeholder:text-ink-40');
  const missing = {
    firstName: !firstName.trim(),
    lastName: !lastName.trim(),
    email: !email.trim(),
  };

  const mailto = () => {
    const lines = [
      t('mailIntro'),
      '',
      `${t('firstName')}: ${firstName}`,
      `${t('lastName')}: ${lastName}`,
      `${t('email')}: ${email}`,
      phone ? `${t('phone')}: ${phone}` : null,
      child ? t('child') : null,
      reason ? `\n${t('reason')}\n${reason}` : null,
    ].filter((l) => l !== null);
    return `mailto:${CAMPAIGN.membershipEmail}?subject=${encodeURIComponent(t('mailSubject'))}&body=${encodeURIComponent(lines.join('\n'))}`;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'idle') return;
    if (missing.firstName || missing.lastName || missing.email) {
      setError('required');
      return;
    }
    setError(null);
    setStatus('sending');
    try {
      const res = await fetch('/api/utmelding', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, reason, child, locale }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setStatus('done');
        return;
      }
      // 503 not_configured is the expected answer until Rabita's mail key is
      // set. Not the visitor's fault, so they get the draft, not a failure.
      if (res.status === 503) {
        window.location.href = mailto();
        setStatus('done');
        return;
      }
      setStatus('idle');
      setError('network');
    } catch {
      setStatus('idle');
      setError('network');
    }
  };

  if (status === 'done') {
    return (
      <div className="p-8 sm:p-10">
        <p className="font-serif text-[1.5rem] leading-tight text-ink">{td('title')}</p>
        <p className="mt-3 max-w-[44ch] text-body text-ink-60">
          {td.rich('body', {
            email: () => <span className="text-ink">{email}</span>,
            contact: () => (
              <a href={`mailto:${CAMPAIGN.membershipEmail}`} className="text-ink underline decoration-gold-deep/50 underline-offset-4 hover:decoration-ink">
                {CAMPAIGN.membershipEmail}
              </a>
            ),
          })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="p-6 text-ink sm:p-8 lg:p-10">
      <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold-deep">{t('eyebrow')}</p>
      <h2 className="mt-3 font-serif text-[clamp(1.5rem,2.6vw,1.9rem)] leading-tight text-ink">{t('heading')}</h2>
      <p className="mt-2 text-[15px] text-ink-60">{t('lede')}</p>

      <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
        <Field id={`${uid}-first`} label={t('firstName')} icon="person" tone="paper" card invalid={error === 'required' && missing.firstName}>
          <input id={`${uid}-first`} autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={field} />
        </Field>
        <Field id={`${uid}-last`} label={t('lastName')} icon="person" tone="paper" card invalid={error === 'required' && missing.lastName}>
          <input id={`${uid}-last`} autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={field} />
        </Field>
        <div className="sm:col-span-2">
          <Field id={`${uid}-email`} label={t('email')} icon="mail" tone="paper" card invalid={error === 'required' && missing.email}>
            <input id={`${uid}-email`} type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field id={`${uid}-phone`} label={t('phone')} icon="phone" tone="paper" card>
            <input id={`${uid}-phone`} type="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field id={`${uid}-reason`} label={t('reason')} hint={t('reasonHint')} icon="message" tone="paper" card>
            <textarea
              id={`${uid}-reason`}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              aria-describedby={`${uid}-reason-hint`}
              className={cn(field, 'min-h-[5rem] resize-none')}
            />
          </Field>
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 text-[13.5px] leading-snug text-ink">
        <input
          type="checkbox"
          checked={child}
          onChange={(e) => setChild(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded-[3px] border-ink/25 accent-gold-deep"
        />
        {t('child')}
      </label>

      {error && (
        <p role="alert" className="mt-4 text-[13.5px] leading-snug text-[#8A3B2E]">
          {error === 'required' ? t('required') : t('networkError', { email: CAMPAIGN.membershipEmail })}
        </p>
      )}

      {/* An outlined button, not the filled gold the join card uses. The
         join card's button is the site's conversion weight; this one should
         be findable but not the loudest thing on the page — his words, "ikke
         fullt så stimulerende". */}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="group mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-ink px-7 text-[15px] font-semibold text-ink transition-colors hover:bg-ink hover:text-paper active:scale-[0.99] disabled:opacity-50"
      >
        {status === 'sending' ? t('sending') : t('submit')}
        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
          &rarr;
        </span>
      </button>
      <p className="mt-3.5 max-w-[48ch] text-[12px] leading-snug text-ink-60">{t('note')}</p>
    </form>
  );
}
