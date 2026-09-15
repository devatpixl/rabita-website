'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { CAMPAIGN } from '@/lib/campaign';
import { Field, VALUE } from './request-form';
import { cn } from '@/lib/cn';

// The persistent contact affordance (client, Gjøremål: "Legge til en
// kontakt-knapp nederst til høyre på siden som ligner på WhatsApp-knapp slik
// at folk kan stille spørsmål samt legge igjen epost-adressen sin").
//
// "LIGNER PÅ" — RESEMBLES. Not a WhatsApp button, and deliberately not the
// green circle with a cartoon speech bubble. Two reasons, one of them the
// client's own words. His sentence asks people to leave their e-mail address,
// and you cannot leave an e-mail address in a WhatsApp chat — WhatsApp knows
// people by phone number. The moment he says e-mail he is describing a form.
// The other reason is that a stock widget in stock green would be the one
// foreign object on a site built from warm paper, Fraunces and gold hairlines;
// it reads as bolted on, which is how a good site starts looking cheap.
//
// So this takes the PATTERN he is pointing at — always there, bottom corner,
// one tap from anywhere — and draws it in the site's own materials: a pill
// carrying a word, because this site is word-led everywhere else, opening a
// sheet of paper rather than a chat window.
//
// If Rabita ever supplies a WhatsApp number, add it as a second row inside the
// panel. Do not put it on the button: the button has one job.

type Status = 'idle' | 'sending' | 'done';
type Err = 'empty' | 'email' | 'network' | null;

/** Deliberately loose. The server validates; this only catches obvious slips
 *  so someone is not told "check your address" for a legitimate odd one. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactFab() {
  const t = useTranslations('contactFab');
  const locale = useLocale();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const uid = useId();

  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<Err>(null);

  const pillRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const wasOpen = useRef(false);

  // Focus THE PANEL on open, not the first field. Focusing the textarea put
  // the site's focus ring (globals.css: 2px solid #b4381f) around it the
  // instant the panel appeared — a rust-red box on a field nobody had chosen
  // to type in, which is what the client saw and asked to remove. It is not a
  // stray style: text fields always match :focus-visible, mouse or keyboard,
  // so programmatic focus on one always draws it.
  //
  // The answer is not to suppress the ring — keyboard users need it, and this
  // panel is a form. It is to move focus where a dialog should put it: on the
  // dialog. Tab then reaches the controls and each lights up properly when
  // the reader actually gets to it.
  useEffect(() => {
    if (!open && wasOpen.current) pillRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // A CALLBACK REF, not a focus() in the effect above. AnimatePresence
  // populates the ref after the parent's effects have run, so focusing from
  // there hit a null ref every time and left focus on <body> — measured at 0,
  // 30, 120, 400 and 900ms, never landing. Focusing as the node attaches has
  // no timing to get wrong.
  const attachPanel = useCallback((node: HTMLDivElement | null) => {
    panelRef.current = node;
    node?.focus();
  }, []);

  // Escape closes, and so does a click outside. Both only while open, so the
  // page carries no listeners for a panel nobody has opened.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  // A prefilled mail draft, used when the server has no transport configured.
  // Nothing a visitor writes is ever dropped on the floor: if we cannot send
  // it for them, we hand them the message addressed and ready.
  const mailto = useCallback(() => {
    const subject = t('mailSubject');
    const body = [question, '', name && `— ${name}`, email].filter(Boolean).join('\n');
    return `mailto:${CAMPAIGN.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [t, question, name, email]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !email.trim()) return setError('empty');
    if (!EMAIL_RE.test(email.trim())) return setError('email');
    setError(null);
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          email: email.trim(),
          name: name.trim(),
          locale,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setStatus('done');
        return;
      }
      // 503 not_configured is the expected answer until Rabita's mail key is
      // set. It is NOT an error the visitor caused, so they get the draft
      // rather than a failure message.
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
  }

  // Never on the certificate: it is a document, and a floating button has no
  // business on one. print:hidden covers the rest of the site.
  if (pathname?.endsWith('/takk/attest')) return null;

  const ease = [0.22, 1, 0.36, 1] as const;
  const anim = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 8, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 8, scale: 0.98 },
      };

  return (
    // z-40, under the nav and the consent banner (both z-50), so it can never
    // float over an open menu or sheet.
    //
    // On a phone this yields the corner entirely while the consent banner is
    // up — see globals.css, html[data-consent='open']. The first attempt
    // LIFTED it instead, on a --fab-bottom custom property, and that failed
    // twice over: Tailwind baked the fallback into `bottom: 1.25rem` rather
    // than emitting the var() at all (setting the property inline changed
    // nothing), and even working it would have needed ~13rem to clear the
    // banner — a number that breaks the moment someone expands the banner's
    // details or a locale wraps it taller. Yielding needs no measurement and
    // cannot drift.
    <div
      data-contact-fab
      className="pointer-events-none fixed bottom-5 end-4 z-40 flex flex-col items-end gap-3 print:hidden sm:end-6"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="panel"
            ref={attachPanel}
            role="dialog"
            aria-modal="false"
            aria-labelledby={`${uid}-title`}
            // -1: a programmatic focus target, never a tab stop. outline-none
            // is safe HERE and only here — it is not an interactive control,
            // and everything inside it keeps its own ring.
            tabIndex={-1}
            {...anim}
            transition={{ duration: reduce ? 0.15 : 0.26, ease }}
            className="pointer-events-auto w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-rule bg-paper outline-none shadow-[0_1px_2px_rgba(26,26,24,0.04),0_30px_70px_-34px_rgba(26,26,24,0.5)]"
          >
            {status === 'done' ? (
              // The panel itself becomes the acknowledgement, the way
              // RequestForm does it. A toast would be a second system.
              <div className="px-6 py-7">
                <span aria-hidden className="block h-px w-10 bg-gold-deep/50" />
                <p className="mt-5 font-serif text-[1.35rem] leading-tight text-ink">
                  {t('doneTitle')}
                </p>
                <p className="mt-2.5 text-[13px] leading-relaxed text-ink-60">{t('doneBody')}</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-ink/25 pb-1 text-[14px] font-semibold text-ink transition-colors hover:border-ink"
                >
                  {t('close')}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="px-5 pb-5 pt-6">
                <div className="flex items-start justify-between gap-4 px-1">
                  <div>
                    <span aria-hidden className="block h-px w-10 bg-gold-deep/50" />
                    <p className="mt-4 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-gold-deep">
                      {t('eyebrow')}
                    </p>
                    <h2
                      id={`${uid}-title`}
                      className="mt-2 font-serif text-[1.35rem] leading-tight text-ink"
                    >
                      {t('heading')}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label={t('close')}
                    className="-me-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-40 transition-colors hover:bg-paper-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep/50"
                  >
                    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                      <path
                        d="M4 4l8 8M12 4l-8 8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                <p className="mt-3 px-1 text-[13px] leading-relaxed text-ink-60">{t('lede')}</p>

                <div className="mt-5 space-y-2.5">
                  <Field id={`${uid}-q`} label={t('question')} icon="message" tone="paper">
                    <textarea
                      id={`${uid}-q`}
                      rows={3}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder={t('questionPlaceholder')}
                      className={cn(VALUE, 'resize-none text-[1rem] text-ink caret-gold-deep placeholder:text-ink-40')}
                    />
                  </Field>
                  <Field
                    id={`${uid}-e`}
                    label={t('email')}
                    icon="mail"
                    tone="paper"
                    invalid={error === 'email'}
                  >
                    <input
                      id={`${uid}-e`}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      className={cn(VALUE, 'text-[1rem] text-ink caret-gold-deep placeholder:text-ink-40')}
                    />
                  </Field>
                  <Field id={`${uid}-n`} label={t('name')} icon="person" tone="paper">
                    <input
                      id={`${uid}-n`}
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('namePlaceholder')}
                      className={cn(VALUE, 'text-[1rem] text-ink caret-gold-deep placeholder:text-ink-40')}
                    />
                  </Field>
                </div>

                {error && (
                  <p role="alert" className="mt-3 px-1 text-[13px] leading-snug text-alert">
                    {t(`error.${error}`)}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-gold-deep disabled:opacity-60"
                >
                  {status === 'sending' ? t('sending') : t('send')}
                  {status !== 'sending' && (
                    <span aria-hidden className="rtl:rotate-180">
                      &rarr;
                    </span>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <motion.button
          key="pill"
          ref={pillRef}
          type="button"
          onClick={() => setOpen(true)}
          // haspopup, NOT aria-expanded. The pill unmounts while the panel
          // is up, so a rendered pill is always "collapsed" — aria-expanded
          // would be a state that never changes, announcing a disclosure
          // relationship that does not exist. haspopup says the true thing:
          // activating this opens a dialog.
          aria-haspopup="dialog"
          {...anim}
          transition={{ duration: reduce ? 0.15 : 0.26, ease }}
          // The pill, not a disc: a word is clearer than a glyph and it is
          // the register the rest of the site speaks in. The shadow is the
          // one already used for the play control, so it sits ON the paper
          // as an object rather than floating as a flat colour.
          //
          // SMALLER ON A PHONE ONLY (client, 2026-09-16: "try to make it
          // smaller ... so it takes less space"). 52px tall and a 15px word
          // is right beside a desktop footer and heavy over a 390px one,
          // where it sat on the credit line. Everything from sm: up is
          // untouched.
          //
          // The floor is min-h-11 — 44px, the tap-target minimum — and the
          // word stays. Dropping to an icon-only disc would take less room
          // again, but the word IS the design here (see above), and a bare
          // speech bubble is the stock-widget look this was drawn to avoid.
          className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-gold-deep ps-4 pe-5 text-paper sm:min-h-[3.25rem] sm:gap-2.5 sm:ps-5 sm:pe-6 shadow-[0_8px_28px_-8px_rgba(26,26,24,0.6)] transition-[background-color,transform] duration-200 hover:bg-ink hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep/60 focus-visible:ring-offset-2 focus-visible:ring-offset-paper motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 sm:h-[18px] sm:w-[18px]" aria-hidden>
            <path
              d="M17 11.5a2.5 2.5 0 01-2.5 2.5H7l-4 3v-3H4.5A2.5 2.5 0 012 11.5v-6A2.5 2.5 0 014.5 3h10A2.5 2.5 0 0117 5.5z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[13.5px] font-semibold sm:text-[15px]">{t('open')}</span>
        </motion.button>
      )}
    </div>
  );
}
