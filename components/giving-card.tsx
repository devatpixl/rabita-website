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
  CAMPAIGN,
  DEFAULT_AMOUNT,
  DEFAULT_FREQUENCY,
  type Frequency,
} from '@/lib/campaign';
import { formatAmount } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import { Counter } from './counter';

// Three-step wizard.
//   1. Amount        — Monthly/Once toggle, presets, zakat
//   2. Payment       — Vipps (recommended) / Card / AvtaleGiro / Bank
//   3. Your details  — name / email / mobile / fnr (disabled) / consent
//                       SKIPPED when Vipps is chosen (Vipps returns those
//                       from its app on the payment side).
//
// Progress indicator reuses the carousel's language (2px hair segments,
// --gold-deep active + completed, --rule track, 6px gap). Total segments
// = 2 on Vipps path, 3 on other methods.
//
// Selection language across the card is unified: 1.5px --ink border on
// transparent fill for chips, toggle segments, and payment rows.
//
// No payment backend exists in this repo — the final "Give" button is a
// clearly-marked TODO. Fødselsnummer is rendered DISABLED with a note
// (never collected, never persisted, never logged) until real payments
// are wired up.

type Step = 1 | 2 | 3;
type PaymentMethod = 'vipps' | 'card' | 'avtalegiro' | 'bank';
const METHODS: readonly PaymentMethod[] = ['vipps', 'card', 'avtalegiro', 'bank'];

type Details = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  consent: boolean;
};

type Props = {
  onSubmit?: (payload: {
    amount: number;
    frequency: Frequency;
    isZakat: boolean;
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

export function GivingCard({ onSubmit, initialAmount }: Props) {
  const t = useTranslations('giving');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const reduced = usePrefersReducedMotion();

  // ── Step 1 state ───────────────────────────────────────────────
  const [frequency, setFrequency] = useState<Frequency>(DEFAULT_FREQUENCY);
  const [presetAmount, setPresetAmount] = useState<number | 'custom'>(
    DEFAULT_AMOUNT,
  );
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isZakat, setIsZakat] = useState<boolean>(false);

  // ── Step 2 state ───────────────────────────────────────────────
  const [method, setMethod] = useState<PaymentMethod>('vipps');

  // ── Step 3 state ───────────────────────────────────────────────
  const [details, setDetails] = useState<Details>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    consent: false,
  });
  const [touched, setTouched] = useState<
    Partial<Record<keyof Details, boolean>>
  >({});

  // ── Wizard state ───────────────────────────────────────────────
  const [step, setStep] = useState<Step>(1);
  const [entered, setEntered] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Three stages always: amount, payment, then who to thank. The count never shrinks mid flow.
  const TOTAL_STEPS = 3;
  const vippsFillsDetails = method === 'vipps';

  // Amount preset sync from openGiveSheet(amount).
  useEffect(() => {
    if (typeof initialAmount !== 'number' || initialAmount <= 0) return;
    if ((AMOUNT_PRESETS as readonly number[]).includes(initialAmount)) {
      setPresetAmount(initialAmount);
      setCustomAmount('');
    } else {
      setPresetAmount('custom');
      setCustomAmount(String(initialAmount));
    }
  }, [initialAmount]);

  // Derived amount.
  const effectiveAmount = useMemo(() => {
    if (presetAmount === 'custom') {
      const parsed = Number.parseInt(customAmount.replace(/\D/g, ''), 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    }
    return presetAmount;
  }, [presetAmount, customAmount]);
  const formattedAmount = formatAmount(locale, effectiveAmount || 0);

  const impactLine = useMemo(() => {
    if (frequency === 'monthly') {
      if (effectiveAmount <= 300) return t('impact.monthlyLow', { amount: formattedAmount });
      if (effectiveAmount <= 999) return t('impact.monthlyMid', { amount: formattedAmount });
      return t('impact.monthlyHigh', { amount: formattedAmount });
    }
    if (effectiveAmount <= 300) return t('impact.onceLow', { amount: formattedAmount });
    if (effectiveAmount < 25_000) return t('impact.onceMid', { amount: formattedAmount });
    return t('impact.onceHigh', { amount: formattedAmount });
  }, [frequency, effectiveAmount, formattedAmount, t]);

  // ── Validation ─────────────────────────────────────────────────
  const errors: Partial<Record<keyof Details, string>> = {};
  if (touched.firstName && !details.firstName.trim()) errors.firstName = t('wizard.errors.required');
  if (touched.lastName && !details.lastName.trim()) errors.lastName = t('wizard.errors.required');
  if (touched.email && !isValidEmail(details.email)) errors.email = t('wizard.errors.email');
  if (touched.mobile && !isValidMobile(details.mobile)) errors.mobile = t('wizard.errors.mobile');
  if (touched.consent && !details.consent) errors.consent = t('wizard.errors.consent');

  const step1Valid = effectiveAmount > 0;
  const step2Valid = METHODS.includes(method);
  const step3Valid =
    details.firstName.trim().length > 0 &&
    details.lastName.trim().length > 0 &&
    isValidEmail(details.email) &&
    isValidMobile(details.mobile) &&
    details.consent;

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
    if (step === 3) {
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
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
      method,
      details: method === 'vipps' ? undefined : details,
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
    method,
    details,
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
      if (!step2Valid) return;
      if (method === 'vipps') {
        finalSubmit();
        return;
      }
      setStep(3);
      return;
    }
    // step === 3
    if (!step3Valid) {
      showTouchedForCurrentStep();
      return;
    }
    finalSubmit();
  };
  const goBack = () => {
    if (step === 1) return;
    setStep((s) => (s === 3 ? 2 : 1) as Step);
  };

  // ── Labels ─────────────────────────────────────────────────────
  const stepLabelText =
    step === 1 ? t('wizard.stepAmount') : step === 2 ? t('wizard.stepPayment') : t('wizard.stepDetails');
  const stepHeading =
    step === 1 ? t('question') : step === 2 ? t('wizard.step2Title') : t('wizard.step3Title');

  const primaryKey = frequency === 'monthly' ? 'primaryMonthly' : 'primaryOnce';
  const giveKey = frequency === 'monthly' ? 'wizard.giveMonthly' : 'wizard.give';

  // Primary button label:
  //   Step 1 → Continue
  //   Step 2 with Vipps → "Give X kr/mo with Vipps" (final)
  //   Step 2 with other → Continue
  //   Step 3 → "Give X kr/mo →" (final, no "with Vipps")
  const primaryContent = (() => {
    if (step === 1) return t('wizard.continue');
    if (step === 2 && method === 'vipps') {
      return t.rich(primaryKey, {
        amount: () => (
          <Counter to={effectiveAmount} locale={locale} mode="live" className="tabular-nums" />
        ),
      });
    }
    if (step === 2) return t('wizard.continue');
    return t.rich(giveKey, {
      amount: () => (
        <Counter to={effectiveAmount} locale={locale} mode="live" className="tabular-nums" />
      ),
    });
  })();

  const isFinalStep = (step === 2 && method === 'vipps') || step === 3;

  const showCustom = presetAmount === 'custom';

  return (
    <div className="w-full bg-paper text-ink flex flex-col">
      {/* Header — progress + step label + heading. */}
      <header className="px-6 pt-5 pb-4 border-b border-rule">
        <ProgressBar current={step} total={TOTAL_STEPS} viaProvider={vippsFillsDetails} />
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
          className="mt-3 font-serif text-xl leading-tight text-ink focus:outline-none focus-visible:outline-none"
        >
          {stepHeading}
        </h2>
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
          className="px-6 py-5"
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
              isZakat={isZakat}
              setIsZakat={setIsZakat}
              impactLine={impactLine}
              showCustom={showCustom}
              locale={locale}
              t={t}
            />
          )}
          {step === 2 && (
            <>
              <StepPayment method={method} setMethod={setMethod} t={t} />
              {vippsFillsDetails && (
                <p className="mt-4 text-[0.85rem] leading-snug text-ink-60">
                  {t('wizard.providerFillsDetails')}
                </p>
              )}
            </>
          )}
          {step === 3 && (
            <StepDetails
              details={details}
              setDetails={setDetails}
              setTouched={setTouched}
              errors={errors}
              t={t}
            />
          )}
        </div>
      </AnimatedHeight>

      {/* Footer buttons — back (ghost) + primary. */}
      <div className="px-6 pb-4 flex items-center gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={goBack}
            className="min-h-12 rounded-btn border border-ink px-4 py-2 text-[14px] font-medium text-ink hover:bg-ink hover:text-paper transition-colors"
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
            'flex-1 min-h-12 rounded-btn bg-gold-deep text-paper px-5 py-3 text-[15px] font-semibold transition-colors duration-200 ease-out hover:bg-ink active:scale-[0.99] disabled:cursor-not-allowed flex items-center justify-center gap-2',
          )}
        >
          <span>{primaryContent}</span>
          <ArrowIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* TODO banner on the final step — surface that payment isn't
          wired yet so nobody thinks this is production-ready. */}
      {isFinalStep && (
        <div className="mx-6 mb-4 border-s-2 border-gold-deep ps-3 py-1 text-[12px] leading-snug text-ink-60">
          {t('wizard.todoSubmit')}
        </div>
      )}

      {/* Trust rail — unchanged. */}
      <footer className="border-t border-rule bg-paper-2/40 px-6 py-3">
        <p className="flex items-center gap-3 font-mono text-[0.75rem] uppercase tracking-[0.18em] text-ink-60">
          <PadlockIcon className="h-3.5 w-3.5 shrink-0" />
          <span>{t('trust', { orgNr: CAMPAIGN.orgNr })}</span>
        </p>
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

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const measure = () => setH(inner.offsetHeight);
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
        transition: reduced ? 'none' : 'height 220ms ease-out',
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
function ProgressBar({
  current,
  total,
  viaProvider,
}: {
  current: number;
  total: number;
  viaProvider?: boolean;
}) {
  return (
    <div
      className="flex items-center w-full"
      style={{ columnGap: '6px', height: '2px' }}
      aria-hidden
    >
      {Array.from({ length: total }).map((_, i) => {
        const done = i + 1 <= current;
        // The last stage happens inside the payment app, so it is drawn as handed off rather than dropped.
        const handedOff = viaProvider && i + 1 === total && !done;
        return (
          <span
            key={i}
            className={cn(
              'flex-1 h-full',
              done ? 'bg-gold-deep' : handedOff ? 'bg-gold-deep/30' : 'bg-rule',
            )}
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
  isZakat: boolean;
  setIsZakat: (v: boolean) => void;
  impactLine: string;
  showCustom: boolean;
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
  isZakat,
  setIsZakat,
  impactLine,
  showCustom,
  locale,
  t,
}: StepAmountProps) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="sr-only">{t('question')}</legend>

      {/* Frequency toggle — shared selection language. */}
      <div
        className="mb-5 relative inline-flex items-center rounded-btn bg-paper-2 p-1 w-full"
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
                'relative z-10 flex-1 min-h-11 rounded-btn text-[14px] transition-colors border-[1.5px]',
                selected
                  ? 'bg-paper border-ink text-ink font-medium'
                  : 'bg-transparent border-transparent text-ink-60 hover:text-ink',
              )}
            >
              {f === 'monthly' ? t('freqMonthly') : t('freqOnce')}
            </button>
          );
        })}
      </div>

      {/* Amount chips */}
      <div
        className="mb-5 grid grid-cols-3 gap-2.5"
        role="radiogroup"
        aria-label={t('customLabel')}
      >
        {AMOUNT_PRESETS.map((amount) => {
          const selected = presetAmount === amount;
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
                'min-h-12 rounded-btn px-3 py-2 text-[14px] tabular-nums transition-colors bg-transparent',
                selected
                  ? 'border-[1.5px] border-ink text-ink font-medium'
                  : 'border border-rule text-ink-60 hover:border-ink-60',
              )}
            >
              {formatAmount(locale, amount)}
            </button>
          );
        })}
        <button
          type="button"
          role="radio"
          aria-checked={presetAmount === 'custom'}
          onClick={() => setPresetAmount('custom')}
          className={cn(
            'min-h-12 rounded-btn px-3 py-2 text-[14px] transition-colors bg-transparent',
            presetAmount === 'custom'
              ? 'border-[1.5px] border-ink text-ink font-medium'
              : 'border border-rule text-ink-60 hover:border-ink-60',
          )}
        >
          {t('customLabel')}
        </button>
      </div>

      {/* Free amount */}
      {showCustom && (
        <label className="mb-5 block">
          <span className="sr-only">{t('customLabel')}</span>
          <div className="flex items-baseline gap-3 border-b border-gold/60 focus-within:border-gold pb-2">
            <input
              autoFocus
              inputMode="numeric"
              pattern="[0-9]*"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value.replace(/\D/g, ''))}
              placeholder={t('customPlaceholder')}
              className="w-full bg-transparent font-serif text-2xl tabular-nums outline-none placeholder:text-ink-60/50"
              aria-describedby="giving-custom-suffix"
            />
            <span id="giving-custom-suffix" className="text-[14px] text-ink-60">
              kr
            </span>
          </div>
        </label>
      )}

      {/* Impact line */}
      <p
        className="mb-4 border-s-2 border-gold ps-3 font-serif italic text-body leading-snug text-ink"
        aria-live="polite"
      >
        {impactLine}
      </p>

      {/* Zakat toggle */}
      <label className="flex items-center gap-3 border-y border-rule py-3 cursor-pointer group">
        <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-ink transition-colors group-hover:border-gold">
          <input
            type="checkbox"
            checked={isZakat}
            onChange={(e) => setIsZakat(e.target.checked)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {isZakat && (
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
        <span className="text-body">{t('zakatLabel')}</span>
      </label>
    </fieldset>
  );
}

// ─────────────────────────────────────────────────────────────────
// Step 2 — payment method rows. Same selection language as chips.
// ─────────────────────────────────────────────────────────────────
type StepPaymentProps = {
  method: PaymentMethod;
  setMethod: (m: PaymentMethod) => void;
  t: ReturnType<typeof useTranslations>;
};
function StepPayment({ method, setMethod, t }: StepPaymentProps) {
  return (
    <fieldset
      className="border-0 p-0 m-0 flex flex-col gap-3"
      role="radiogroup"
      aria-label={t('wizard.step2Title')}
    >
      <legend className="sr-only">{t('wizard.step2Title')}</legend>
      {METHODS.map((m) => {
        const selected = method === m;
        const isVipps = m === 'vipps';
        return (
          <label
            key={m}
            className={cn(
              'block cursor-pointer rounded-btn px-4 py-3 transition-colors bg-transparent',
              selected
                ? 'border-[1.5px] border-ink'
                : 'border border-rule hover:border-ink-60',
            )}
          >
            <input
              type="radio"
              name="method"
              value={m}
              checked={selected}
              onChange={() => setMethod(m)}
              className="sr-only"
            />
            <div className="flex items-baseline justify-between gap-3">
              <span
                className={cn(
                  'text-[15px]',
                  selected ? 'text-ink font-medium' : 'text-ink-60 font-normal',
                )}
              >
                {t(`wizard.methods.${m}.name`)}
              </span>
              {isVipps && (
                <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-gold-deep">
                  {t('wizard.recommended')}
                </span>
              )}
            </div>
            <p className="mt-1 text-[13px] leading-snug text-ink-60">
              {t(`wizard.methods.${m}.detail`)}
            </p>
          </label>
        );
      })}
    </fieldset>
  );
}

// ─────────────────────────────────────────────────────────────────
// Step 3 — donor details. Fødselsnummer is DISABLED with a note
// because no payment backend exists to receive it (never collect
// what you can't securely process).
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

      {/* Fødselsnummer — disabled, no collection, no persistence. */}
      <div>
        <label className="block">
          <span className="block text-[13px] text-ink-60 mb-1">
            {t('wizard.fields.fnr')}{' '}
            <span className="text-[12px] uppercase tracking-widest text-ink-60/70">
              ({t('wizard.fields.optional')})
            </span>
          </span>
          <input
            type="text"
            disabled
            aria-describedby="fnr-note"
            placeholder="000000 00000"
            className="w-full min-h-11 rounded-btn border border-rule bg-paper-2/60 px-3 py-2 text-[14px] text-ink-60/70 cursor-not-allowed"
          />
        </label>
        <p
          id="fnr-note"
          className="mt-2 border-s border-gold-deep ps-2 text-[12px] leading-snug text-ink-60"
        >
          {t('wizard.fields.fnrDisabled')}
          <br />
          <span className="text-ink-60/80">{t('wizard.fields.fnrHint')}</span>
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

function PadlockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
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
