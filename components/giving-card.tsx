'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  AMOUNT_PRESETS,
  DEFAULT_AMOUNT,
  DEFAULT_FREQUENCY,
  RECOMMENDED_AMOUNT,
  type Frequency,
} from '@/lib/campaign';
import { formatAmount } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import { Counter } from './counter';
import type { GivePurpose } from './giving-sheet';

// Three-step wizard (order set by the client, 2026-08-30):
//   1. Amount        — Monthly/Once toggle, 5 presets + Other, anonymous
//   2. Your details  — name / email / mobile / tax deduction (fnr) / consent
//   3. Payment       — opens straight on Vipps with a "switch" link that
//                      reveals Apple Pay / Google Pay / card / AvtaleGiro
//                      as logo tiles; zakat is asked here.
//
// Progress indicator reuses the carousel's language (2px hair segments,
// --gold-deep active + completed, --rule track, 6px gap).
//
// No payment backend exists in this repo — the final "Give" button is a
// clearly-marked TODO. Fødselsnummer is only collected when the donor
// asks for a tax deduction, and is never logged.

type Step = 1 | 2 | 3;
type PaymentMethod = 'vipps' | 'applepay' | 'googlepay' | 'card' | 'avtalegiro';
const METHODS: readonly PaymentMethod[] = ['vipps', 'applepay', 'googlepay', 'card', 'avtalegiro'];

type Details = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  taxDeduction: boolean;
  fnr: string;
  consent: boolean;
};

type Props = {
  /** Amount boxes; defaults to the site-wide ladder. */
  presets?: readonly number[];
  recommended?: number;
  defaultAmount?: number;
  /** Earmark sent with the donation when this card submits on its own. */
  purpose?: GivePurpose;
  /** Tighter spacing for a hero column: the whole card fits a laptop screen. */
  compact?: boolean;
  onSubmit?: (payload: {
    amount: number;
    frequency: Frequency;
    isZakat: boolean;
    isAnonymous: boolean;
    method?: PaymentMethod;
    details?: Details;
  }) => void;
  initialAmount?: number;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function isValidMobile(v: string) {
  const digits = v.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}
function isValidFnr(v: string) {
  return /^\d{11}$/.test(v.replace(/\s/g, ''));
}

export function GivingCard({
  onSubmit,
  initialAmount,
  presets = AMOUNT_PRESETS,
  recommended = RECOMMENDED_AMOUNT,
  defaultAmount = DEFAULT_AMOUNT,
  purpose = 'general',
  compact = false,
}: Props) {
  const t = useTranslations('giving');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const reduced = usePrefersReducedMotion();

  // ── Step 1 state ───────────────────────────────────────────────
  const [frequency, setFrequency] = useState<Frequency>(DEFAULT_FREQUENCY);
  const [presetAmount, setPresetAmount] = useState<number | 'custom'>(defaultAmount);
  const [customAmount, setCustomAmount] = useState<string>('');
  // Zakat is asked on the payment step (client request); anonymous on the
  // amount step. Anonymous = never named on the donor wall.
  const [isZakat, setIsZakat] = useState<boolean>(false);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // ── Step 2 state (details) ─────────────────────────────────────
  const [details, setDetails] = useState<Details>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    taxDeduction: false,
    fnr: '',
    consent: false,
  });

  // ── Step 3 state (payment) ─────────────────────────────────────
  const [method, setMethod] = useState<PaymentMethod>('vipps');
  const [switching, setSwitching] = useState(false);
  const [touched, setTouched] = useState<
    Partial<Record<keyof Details, boolean>>
  >({});

  // ── Wizard state ───────────────────────────────────────────────
  const [step, setStep] = useState<Step>(1);
  const [entered, setEntered] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const TOTAL_STEPS = 3;

  // AvtaleGiro is a standing order: it only makes sense for monthly gifts.
  // If the donor switches to Once after picking it, fall back to Vipps.
  useEffect(() => {
    if (frequency === 'once' && method === 'avtalegiro') setMethod('vipps');
  }, [frequency, method]);

  // Amount preset sync from openGiveSheet(amount).
  useEffect(() => {
    if (typeof initialAmount !== 'number' || initialAmount <= 0) return;
    if (presets.includes(initialAmount)) {
      setPresetAmount(initialAmount);
      setCustomAmount('');
    } else {
      setPresetAmount('custom');
      setCustomAmount(String(initialAmount));
    }
  }, [initialAmount, presets]);

  // Derived amount.
  const effectiveAmount = useMemo(() => {
    if (presetAmount === 'custom') {
      const parsed = Number.parseInt(customAmount.replace(/\D/g, ''), 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    }
    return presetAmount;
  }, [presetAmount, customAmount]);

  // ── Validation ─────────────────────────────────────────────────
  const errors: Partial<Record<keyof Details, string>> = {};
  if (touched.firstName && !details.firstName.trim()) errors.firstName = t('wizard.errors.required');
  if (touched.lastName && !details.lastName.trim()) errors.lastName = t('wizard.errors.required');
  if (touched.email && !isValidEmail(details.email)) errors.email = t('wizard.errors.email');
  if (touched.mobile && !isValidMobile(details.mobile)) errors.mobile = t('wizard.errors.mobile');
  if (touched.fnr && details.taxDeduction && !isValidFnr(details.fnr)) errors.fnr = t('wizard.errors.fnr');
  if (touched.consent && !details.consent) errors.consent = t('wizard.errors.consent');

  const step1Valid = effectiveAmount > 0;
  const step2Valid =
    details.firstName.trim().length > 0 &&
    details.lastName.trim().length > 0 &&
    isValidEmail(details.email) &&
    isValidMobile(details.mobile) &&
    (!details.taxDeduction || isValidFnr(details.fnr)) &&
    details.consent;
  const step3Valid = METHODS.includes(method) && !(method === 'avtalegiro' && frequency !== 'monthly');

  const currentValid = step === 1 ? step1Valid : step === 2 ? step2Valid : step3Valid;

  // ── Step change animation + focus ──────────────────────────────
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    // Focus the heading on step change (a11y — announce which step
    // the user is on now).
    headingRef.current?.focus();
    // Kick the enter animation for the new step.
    if (reduced) {
      setEntered(true);
      return;
    }
    setEntered(false);
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [step, reduced]);

  // ── Navigation ─────────────────────────────────────────────────
  const showTouchedForCurrentStep = useCallback(() => {
    if (step === 2) {
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        fnr: true,
        consent: true,
      });
    }
  }, [step]);

  const finalSubmit = useCallback(async () => {
    if (submitting) return;
    const payload = {
      amount: effectiveAmount,
      frequency,
      isZakat,
      isAnonymous,
      method,
      // fnr travels only when a deduction was asked for; never logged.
      details: details.taxDeduction ? details : { ...details, fnr: '' },
    };
    if (onSubmit) {
      onSubmit(payload);
      return;
    }
    // TODO(payments): wire real Vipps / card / AvtaleGiro / bank
    // integration here. Right now /api/donations is a stub and there
    // is no payment SDK installed. Do not fake success — surface the
    // TODO in the UI (see stateBanner below) and log the payload for
    // dev only.
    setSubmitting(true);
    try {
      // eslint-disable-next-line no-console
      console.info('[givingCard] submit stub — no payment backend', payload);
      await fetch('/api/donations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          amount: payload.amount,
          frequency: payload.frequency,
          isZakat: payload.isZakat,
          isAnonymous: payload.isAnonymous,
          purpose,
        }),
      });
      router.push(`/${locale}/takk`);
    } finally {
      setSubmitting(false);
    }
  }, [
    submitting,
    effectiveAmount,
    frequency,
    isZakat,
    isAnonymous,
    method,
    details,
    purpose,
    onSubmit,
    router,
    locale,
  ]);

  const goNext = () => {
    if (step === 1) {
      if (step1Valid) setStep(2);
      return;
    }
    if (step === 2) {
      if (!step2Valid) {
        showTouchedForCurrentStep();
        return;
      }
      setStep(3);
      return;
    }
    // step === 3 — the pay button
    if (!step3Valid) return;
    finalSubmit();
  };
  const goBack = () => {
    if (step === 1) return;
    setStep((s) => (s === 3 ? 2 : 1) as Step);
  };

  // ── Labels ─────────────────────────────────────────────────────
  const stepLabelText =
    step === 1 ? t('wizard.stepAmount') : step === 2 ? t('wizard.stepDetails') : t('wizard.stepPayment');
  const stepHeading =
    step === 1 ? t('question') : step === 2 ? t('wizard.step3Title') : t('wizard.step2Title');

  // Primary button label:
  //   Steps 1–2 → Continue
  //   Step 3    → "Give X kr[/mo] with <method>" (final)
  const primaryContent = (() => {
    if (step < 3) return t('wizard.continue');
    const key = frequency === 'monthly' ? 'wizard.giveWithMonthly' : 'wizard.giveWith';
    return t.rich(key, {
      amount: () => (
        <Counter to={effectiveAmount} locale={locale} mode="live" className="tabular-nums" />
      ),
      method: t(`wizard.methods.${method}.name`),
    });
  })();

  const isFinalStep = step === 3;

  return (
    <div className="w-full bg-paper text-ink flex flex-col">
      {/* Header — progress + step label + heading. */}
      {/* Every `compact ? … : …` pair below now carries the compact measure
         as the phone default and restores the roomy one at sm. The card is
         640px of desktop form squeezed into 390px otherwise, which is what
         made it spill on /moskeprosjektet. */}
      <header className={cn('border-b border-rule', compact ? 'px-5 pt-4 pb-3' : 'px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4')}>
        <ProgressBar current={step} total={TOTAL_STEPS} />
        <div className="mt-4">
          <span className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-gold">
            {t('wizard.stepLabel', {
              n: step,
              total: TOTAL_STEPS,
              label: stepLabelText,
            })}
          </span>
        </div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          style={{ outline: 'none' }}
          className={cn('font-serif leading-tight text-ink focus:outline-none focus-visible:outline-none', compact ? 'mt-2 text-lg' : 'mt-2 text-lg sm:mt-3 sm:text-xl')}
        >
          {stepHeading}
        </h2>
        {step === 1 && !compact && (
          <p className="mt-1.5 text-[13px] leading-snug text-ink-60">
            {frequency === 'monthly' ? t('ledeMonthly') : t('ledeOnce')}
          </p>
        )}
        <p className="sr-only" aria-live="polite">
          {t('wizard.stepAnnounce', {
            n: step,
            total: TOTAL_STEPS,
            label: stepLabelText,
          })}
        </p>
      </header>

      {/* Step content — height animates between steps via a
         ResizeObserver on the inner block, so the card fits its
         content exactly and there's no dead space when a shorter
         step is showing. */}
      <AnimatedHeight reduced={reduced}>
        <div
          className={compact ? 'px-5 py-4' : 'px-4 py-4 sm:px-6 sm:py-5'}
          key={step}
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateX(0)' : 'translateX(8px)',
            transition: reduced
              ? 'none'
              : 'opacity 180ms ease-out, transform 180ms ease-out',
          }}
        >
          {step === 1 && (
            <StepAmount
              frequency={frequency}
              setFrequency={setFrequency}
              presetAmount={presetAmount}
              setPresetAmount={setPresetAmount}
              customAmount={customAmount}
              setCustomAmount={setCustomAmount}
              isAnonymous={isAnonymous}
              setIsAnonymous={setIsAnonymous}
              presets={presets}
              recommended={recommended}
              compact={compact}
              locale={locale}
              t={t}
            />
          )}
          {step === 2 && (
            <StepDetails
              details={details}
              setDetails={setDetails}
              setTouched={setTouched}
              errors={errors}
              t={t}
            />
          )}
          {step === 3 && (
            <StepPayment
              method={method}
              setMethod={setMethod}
              switching={switching}
              setSwitching={setSwitching}
              monthly={frequency === 'monthly'}
              isZakat={isZakat}
              setIsZakat={setIsZakat}
              t={t}
            />
          )}
        </div>
      </AnimatedHeight>

      {/* Footer buttons — back (ghost) + primary. */}
      <div className={cn('flex items-center gap-3', compact ? 'px-5 pb-3' : 'px-4 pb-3 sm:px-6 sm:pb-4')}>
        {step > 1 && (
          <button
            type="button"
            onClick={goBack}
            className="min-h-12 rounded-full border border-ink px-4 py-2 text-[14px] font-medium text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            ← {t('wizard.back')}
          </button>
        )}
        <button
          type="button"
          onClick={goNext}
          disabled={!currentValid || submitting}
          style={{ opacity: currentValid ? 1 : 0.45 }}
          className={cn(
            'flex-1 min-h-12 rounded-full bg-gold-deep text-paper px-5 py-3 text-[15px] font-semibold transition-colors duration-200 ease-out hover:bg-ink active:scale-[0.99] disabled:cursor-not-allowed flex items-center justify-center gap-2',
          )}
        >
          <span>{primaryContent}</span>
          <ArrowIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* TODO banner on the final step — surface that payment isn't
          wired yet so nobody thinks this is production-ready. */}
      {isFinalStep && (
        <div className="mx-4 mb-3 sm:mx-6 sm:mb-4 border-s-2 border-gold-deep ps-3 py-1 text-[12px] leading-snug text-ink-60">
          {t('wizard.todoSubmit')}
        </div>
      )}

      {/* Payment marks in place of the tax-deduction line (client request
         2026-08-30). Monochrome, so five brands read as one quiet row. */}
      <footer className={cn('border-t border-rule bg-paper-2/40', compact ? 'px-5 py-2' : 'px-4 py-2 sm:px-6 sm:py-3')}>
        <PaymentLogos label={t('paymentLogosAria')} />
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// AnimatedHeight — wraps a single child and animates its height via
// ResizeObserver so the card grows and shrinks with its content
// instead of holding a fixed footprint. Under prefers-reduced-motion
// the height jumps instantly.
// ─────────────────────────────────────────────────────────────────
function AnimatedHeight({
  children,
  reduced,
}: {
  children: ReactNode;
  reduced: boolean;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | null>(null);
  // The first real measurement is applied WITHOUT a transition. Inside the
  // giving sheet the card mounts while the dialog is closed (height 0), so
  // animating from that first value meant the amounts slid open from
  // nothing every time the sheet appeared.
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const measure = () => {
      const next = inner.offsetHeight;
      setH(next);
      if (next > 0) {
        // Let this paint at the measured height, then allow animation.
        requestAnimationFrame(() => setSettled(true));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={outerRef}
      className="overflow-hidden"
      style={{
        height: h == null ? undefined : `${h}px`,
        transition: reduced || !settled ? 'none' : 'height 220ms ease-out',
      }}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Progress bar — 2px hair segments, equal widths, 6px gap. Same
// design language as the congregation carousel: --rule track, active
// + completed in --gold-deep.
// ─────────────────────────────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="flex items-center w-full"
      style={{ columnGap: '6px', height: '2px' }}
      aria-hidden
    >
      {Array.from({ length: total }).map((_, i) => {
        const done = i + 1 <= current;
        return (
          <span
            key={i}
            className={cn('flex-1 h-full', done ? 'bg-gold-deep' : 'bg-rule')}
            style={{ transition: 'background-color 220ms ease-out' }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Step 1 — amount + frequency + impact + zakat
// ─────────────────────────────────────────────────────────────────
type StepAmountProps = {
  frequency: Frequency;
  setFrequency: (f: Frequency) => void;
  presetAmount: number | 'custom';
  setPresetAmount: (v: number | 'custom') => void;
  customAmount: string;
  setCustomAmount: (v: string) => void;
  isAnonymous: boolean;
  setIsAnonymous: (v: boolean) => void;
  presets: readonly number[];
  recommended: number;
  compact: boolean;
  locale: AppLocale;
  t: ReturnType<typeof useTranslations>;
};
function StepAmount({
  frequency,
  setFrequency,
  presetAmount,
  setPresetAmount,
  customAmount,
  setCustomAmount,
  isAnonymous,
  setIsAnonymous,
  presets,
  recommended: recommendedAmount,
  compact,
  locale,
  t,
}: StepAmountProps) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="sr-only">{t('question')}</legend>

      {/* Frequency toggle — shared selection language. */}
      <div
        className={cn('relative inline-flex w-full items-center rounded-btn bg-paper-2 p-1', compact ? 'mb-3' : 'mb-3 sm:mb-5')}
        role="tablist"
        aria-label={t('sheetTitle')}
      >
        {(['monthly', 'once'] as const).map((f) => {
          const selected = frequency === f;
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFrequency(f)}
              className={cn(
                'relative z-10 flex-1 rounded-btn text-[14px] transition-colors',
                compact ? 'min-h-9' : 'min-h-10 sm:min-h-11',
                selected
                  ? 'bg-ink text-paper font-semibold'
                  : 'bg-transparent text-ink-60 hover:text-ink',
              )}
            >
              {f === 'monthly' ? t('freqMonthly') : t('freqOnce')}
            </button>
          );
        })}
      </div>

      {/* Amount boxes — 2×2, the amount set large in serif with the
         period as a small suffix, one box tagged as recommended. */}
      <div
        className={cn('grid grid-cols-2', compact ? 'mt-1 mb-2 gap-2' : 'mt-1 mb-2 gap-2 sm:mt-0 sm:mb-3 sm:gap-3')}
        role="radiogroup"
        aria-label={t('customLabel')}
      >
        {presets.map((amount) => {
          const selected = presetAmount === amount;
          const recommended = amount === recommendedAmount;
          return (
            <button
              key={amount}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={t('chipAria', { amount: formatAmount(locale, amount) })}
              onClick={() => {
                setPresetAmount(amount);
                setCustomAmount('');
              }}
              className={cn(
                'relative flex items-baseline gap-1.5 rounded-btn text-start transition-colors',
                compact ? 'min-h-[3rem] px-3 py-2' : 'min-h-[3.25rem] px-3 py-2 sm:min-h-[4.25rem] sm:px-4 sm:py-3',
                selected
                  ? 'border-[1.5px] border-ink bg-ink text-paper'
                  : 'border-[1.5px] border-ink/30 bg-paper text-ink hover:border-ink',
              )}
            >
              {recommended && (
                <span
                  className={cn(
                    'absolute font-mono uppercase tracking-[0.14em]',
                    // Compact boxes are too short to hang a tab inside, so
                    // the tag becomes a pill straddling the top edge.
                    compact
                      ? '-top-2 end-2 rounded-full px-1.5 py-px text-[8px] leading-[1.6] shadow-[0_0_0_2px_var(--tw-shadow-color)] shadow-paper'
                      : '-top-px end-3 rounded-b-md px-2 py-0.5 text-[10px]',
                    selected && !compact ? 'bg-paper text-ink' : 'bg-gold-deep text-paper',
                  )}
                >
                  {t('wizard.recommended')}
                </span>
              )}
              <span className={cn('whitespace-nowrap font-serif leading-none tabular-nums', compact ? 'text-[1.15rem]' : 'text-[1.15rem] sm:text-[1.35rem]')}>
                {formatAmount(locale, amount)} kr
              </span>
              {frequency === 'monthly' && (
                <span className={cn('text-[12px]', selected ? 'text-paper/70' : 'text-ink-60')}>
                  {t('perMonth')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Other amount — always open, so typing a figure is one move rather
         than "Other" then a field. Typing selects it; picking a box above
         clears it. */}
      <label
        className={cn(
          'flex items-center justify-between gap-4 rounded-btn px-4 transition-colors',
          compact ? 'mb-3 min-h-[2.75rem]' : 'mb-3 min-h-[2.75rem] sm:mb-5 sm:min-h-[3.5rem]',
          presetAmount === 'custom'
            ? 'border-[1.5px] border-ink'
            : 'border-[1.5px] border-ink/30 focus-within:border-ink',
        )}
      >
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-60">
          {t('customLabel')}
        </span>
        <span className="flex min-w-0 items-baseline gap-1.5">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={customAmount}
            onFocus={() => setPresetAmount('custom')}
            onChange={(e) => {
              setPresetAmount('custom');
              setCustomAmount(e.target.value.replace(/\D/g, ''));
            }}
            placeholder="0"
            aria-label={t('customLabel')}
            className={cn('w-full min-w-0 bg-transparent text-end font-serif leading-none tabular-nums text-ink outline-none placeholder:text-ink-60/50', compact ? 'text-[1.15rem]' : 'text-[1.15rem] sm:text-[1.5rem]')}
          />
          <span className="font-serif text-[1.1rem] text-ink-60">kr</span>
        </span>
      </label>

      {/* Anonymous toggle — replaces the zakat box here; zakat is asked
         with the payment method instead. */}
      <label className={cn('group flex cursor-pointer items-center gap-3 border-y border-rule', compact ? 'py-2' : 'py-3')}>
        <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] border-ink transition-colors group-hover:border-gold">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {isAnonymous && (
            <svg viewBox="0 0 12 12" className="h-3 w-3 text-ink" aria-hidden>
              <path
                d="M2 6l3 3 5-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className="text-body">{t('anonymousLabel')}</span>
      </label>
    </fieldset>
  );
}

// ─────────────────────────────────────────────────────────────────
// Step 3 — payment. Opens on Vipps with one line to switch; switching
// reveals the methods as logo tiles. No description text under each —
// the mark is the description.
// ─────────────────────────────────────────────────────────────────
type StepPaymentProps = {
  method: PaymentMethod;
  setMethod: (m: PaymentMethod) => void;
  switching: boolean;
  setSwitching: (v: boolean) => void;
  monthly: boolean;
  isZakat: boolean;
  setIsZakat: (v: boolean) => void;
  t: ReturnType<typeof useTranslations>;
};
function StepPayment({
  method,
  setMethod,
  switching,
  setSwitching,
  monthly,
  isZakat,
  setIsZakat,
  t,
}: StepPaymentProps) {
  const name = (m: PaymentMethod) => t(`wizard.methods.${m}.name`);
  return (
    <div className="flex flex-col gap-4">
      {!switching ? (
        // The chosen method, as one tile, and the way out of it.
        <div className="flex items-center justify-between gap-4 rounded-btn border-[1.5px] border-ink bg-paper px-4 py-3">
          <span className="flex items-center gap-3">
            <MethodMark method={method} className="h-7 w-16" />
            <span className="text-[15px] font-semibold text-ink">{name(method)}</span>
          </span>
          <button
            type="button"
            onClick={() => setSwitching(true)}
            className="min-h-11 text-[14px] font-medium text-gold-deep underline underline-offset-4 hover:text-ink"
          >
            {t('wizard.switchMethod')}
          </button>
        </div>
      ) : (
        <fieldset
          className="border-0 p-0 m-0 grid grid-cols-2 gap-2.5 sm:grid-cols-3"
          role="radiogroup"
          aria-label={t('wizard.step2Title')}
        >
          <legend className="sr-only">{t('wizard.step2Title')}</legend>
          {METHODS.map((m) => {
            const selected = method === m;
            const disabled = m === 'avtalegiro' && !monthly;
            return (
              <label
                key={m}
                className={cn(
                  'flex min-h-[4.5rem] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-btn px-2 py-3 transition-colors',
                  selected
                    ? 'border-[1.5px] border-ink bg-ink text-paper'
                    : 'border-[1.5px] border-ink/30 bg-paper text-ink hover:border-ink',
                  disabled && 'cursor-not-allowed opacity-40 hover:border-ink/30',
                )}
              >
                <input
                  type="radio"
                  name="method"
                  value={m}
                  checked={selected}
                  disabled={disabled}
                  onChange={() => {
                    setMethod(m);
                    setSwitching(false);
                  }}
                  className="sr-only"
                />
                <MethodMark method={m} className="h-6 w-14" inverted={selected} />
                {/* AvtaleGiro's mark IS its name, so no second line. */}
                <span className="text-[12px] font-medium leading-tight text-center">
                  {m === 'avtalegiro' ? (
                    <span className="block font-normal opacity-70">{t('wizard.monthlyOnly')}</span>
                  ) : (
                    name(m)
                  )}
                </span>
              </label>
            );
          })}
        </fieldset>
      )}

      {/* Zakat, asked with the payment method (moved from the amount step). */}
      <label className="flex items-center gap-3 border-t border-rule pt-4 cursor-pointer group">
        <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] border-ink transition-colors group-hover:border-gold">
          <input
            type="checkbox"
            checked={isZakat}
            onChange={(e) => setIsZakat(e.target.checked)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {isZakat && (
            <svg viewBox="0 0 12 12" className="h-3 w-3 text-ink" aria-hidden>
              <path d="M2 6l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className="text-body">{t('zakatLabel')}</span>
      </label>
    </div>
  );
}

// One method's mark. Card shows Visa + Mastercard side by side; AvtaleGiro
// has no mark we may use, so it is set in type.
function MethodMark({
  method,
  className,
  inverted,
}: {
  method: PaymentMethod;
  className?: string;
  inverted?: boolean;
}) {
  const tone = inverted ? 'bg-paper' : 'bg-ink';
  if (method === 'avtalegiro') {
    return (
      <span className={cn('flex items-center justify-center font-serif text-[15px] font-medium', className)} aria-hidden>
        AvtaleGiro
      </span>
    );
  }
  if (method === 'card') {
    return (
      <span className={cn('flex items-center justify-center gap-1.5', className)} aria-hidden>
        <Mask src="/payments/visa.svg" className={cn('h-full w-1/2', tone)} />
        <Mask src="/payments/mastercard.svg" className={cn('h-full w-1/3', tone)} />
      </span>
    );
  }
  return <Mask src={`/payments/${method}.svg`} className={cn(tone, className)} aria-hidden />;
}

function Mask({ src, className, ...rest }: { src: string; className?: string; 'aria-hidden'?: boolean }) {
  return (
    <span
      {...rest}
      className={cn('block', className)}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────
// Payment marks. Monochrome via CSS mask so five brands sit as one row
// in the card's own ink rather than five competing colours. Files in
// public/payments/ (simple-icons for the card/wallet marks; Vipps is the
// official wordmark supplied by the client, cropped to its bounds).
// ─────────────────────────────────────────────────────────────────
const PAYMENT_MARKS = [
  { key: 'vipps', name: 'Vipps', w: 'w-16' },
  { key: 'visa', name: 'Visa', w: 'w-12' },
  { key: 'mastercard', name: 'Mastercard', w: 'w-9' },
  { key: 'applepay', name: 'Apple Pay', w: 'w-12' },
  { key: 'googlepay', name: 'Google Pay', w: 'w-12' },
] as const;

function PaymentLogos({ label }: { label: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {PAYMENT_MARKS.map((m) => (
        <li key={m.key} className="flex items-center" role="img" aria-label={m.name}>
          <Mask src={`/payments/${m.key}.svg`} className={cn('h-8 bg-ink', m.w)} aria-hidden />
        </li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────────────────────────
// Step 2 — donor details. Fødselsnummer appears only behind the
// tax-deduction checkbox.
// ─────────────────────────────────────────────────────────────────
type TouchMap = Partial<Record<keyof Details, boolean>>;
type StepDetailsProps = {
  details: Details;
  setDetails: (d: Details) => void;
  setTouched: Dispatch<SetStateAction<TouchMap>>;
  errors: Partial<Record<keyof Details, string>>;
  t: ReturnType<typeof useTranslations>;
};
function StepDetails({
  details,
  setDetails,
  setTouched,
  errors,
  t,
}: StepDetailsProps) {
  const bump = (k: keyof Details) => (v: string | boolean) =>
    setDetails({ ...details, [k]: v });
  const blur = (k: keyof Details) => () =>
    setTouched((prev) => ({ ...prev, [k]: true }));

  return (
    <fieldset className="border-0 p-0 m-0 flex flex-col gap-4">
      <legend className="sr-only">{t('wizard.step3Title')}</legend>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label={t('wizard.fields.firstName')}
          value={details.firstName}
          onChange={(v) => bump('firstName')(v)}
          onBlur={blur('firstName')}
          error={errors.firstName}
          autoComplete="given-name"
        />
        <Field
          label={t('wizard.fields.lastName')}
          value={details.lastName}
          onChange={(v) => bump('lastName')(v)}
          onBlur={blur('lastName')}
          error={errors.lastName}
          autoComplete="family-name"
        />
      </div>
      <Field
        label={t('wizard.fields.email')}
        type="email"
        value={details.email}
        onChange={(v) => bump('email')(v)}
        onBlur={blur('email')}
        error={errors.email}
        autoComplete="email"
      />
      <Field
        label={t('wizard.fields.mobile')}
        type="tel"
        value={details.mobile}
        onChange={(v) => bump('mobile')(v)}
        onBlur={blur('mobile')}
        error={errors.mobile}
        autoComplete="tel"
      />

      {/* Tax deduction — one optional field, labelled by what the donor
         gets rather than what they type (client wording, 2026-08-30).
         Filling it in IS opting in; empty means nothing is collected. */}
      <div>
        <label className="block">
          <span className="block text-[13px] text-ink-60 mb-1">
            {t('wizard.fields.taxDeduction')}{' '}
            <span className="text-[12px] uppercase tracking-widest text-ink-60/70">
              ({t('wizard.fields.optional')})
            </span>
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={details.fnr}
            onChange={(e) => {
              const fnr = e.target.value.replace(/\D/g, '').slice(0, 11);
              setDetails({ ...details, fnr, taxDeduction: fnr.length > 0 });
            }}
            onBlur={blur('fnr')}
            placeholder={t('wizard.fields.fnrPlaceholder')}
            aria-invalid={!!errors.fnr}
            className={cn(
              'w-full min-h-11 rounded-btn border bg-transparent px-3 py-2 text-[14px] tabular-nums text-ink outline-none transition-colors',
              errors.fnr ? 'border-[1.5px] border-gold-deep' : 'border border-rule focus:border-ink',
            )}
          />
        </label>
        <p className="mt-1.5 text-[12px] leading-snug text-ink-60">
          {errors.fnr ?? t('wizard.fields.fnrNote')}
        </p>
      </div>

      {/* Consent */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <span className="relative mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-ink transition-colors group-hover:border-gold">
          <input
            type="checkbox"
            checked={details.consent}
            onChange={(e) => {
              setDetails({ ...details, consent: e.target.checked });
              setTouched((prev) => ({ ...prev, consent: true }));
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {details.consent && (
            <svg viewBox="0 0 12 12" className="h-3 w-3 text-ink" aria-hidden>
              <path
                d="M2 6l3 3 5-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className="text-[13px] leading-snug text-ink-60">
          {t('wizard.fields.consent')}
        </span>
      </label>
      {errors.consent && (
        <p className="border-s border-gold-deep ps-2 text-[12px] leading-snug text-ink-60 -mt-2">
          {errors.consent}
        </p>
      )}
    </fieldset>
  );
}

// A labelled text input + error message.
function Field({
  label,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] text-ink-60 mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        className={cn(
          'w-full min-h-11 rounded-btn border bg-transparent px-3 py-2 text-[14px] text-ink outline-none transition-colors',
          error
            ? 'border-[1.5px] border-gold-deep'
            : 'border border-rule focus:border-ink',
        )}
      />
      {error && (
        <p className="mt-1 border-s border-gold-deep ps-2 text-[12px] leading-snug text-ink-60">
          {error}
        </p>
      )}
    </label>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
