'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { routing, type AppLocale } from '@/i18n/routing';

// Globe, three scripts, no flags (§2, §12). Preserves the current path
// when switching locales so an Arabic reader on /moskeprosjektet lands
// on the Arabic version of the same route.
//
// Chrome-scale display: two-letter code + chevron (e.g. "EN ▾"). The
// full script name lives in the dropdown so it's still discoverable.
// Trigger colour rides the dusk utility strip: text-dusk-60, hover
// text-paper.
const LOCALE_LABELS: Record<AppLocale, string> = {
  no: 'Norsk',
  en: 'English',
  ar: 'العربية',
};

const LOCALE_SHORT: Record<AppLocale, string> = {
  no: 'NO',
  en: 'EN',
  ar: 'AR',
};

export function LanguageSwitcher({
  tone = 'ink',
  drop = 'down',
}: { tone?: 'ink' | 'paper'; drop?: 'down' | 'up' } = {}) {
  const trigger =
    tone === 'paper'
      ? 'text-paper/70 hover:text-paper'
      : 'text-ink-60 hover:text-ink';
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const current = useLocale() as AppLocale;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const swap = (locale: AppLocale) => {
    const rest = pathname.replace(/^\/(no|en|ar)/, '') || '/';
    router.push(`/${locale}${rest === '/' ? '' : rest}`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={LOCALE_LABELS[current]}
        className={`flex min-h-11 items-center gap-2 rounded-full px-2 py-1 text-label uppercase tracking-widest transition-colors ${trigger}`}
      >
        <GlobeIcon className="h-4 w-4" aria-hidden />
        <span className="tabular-nums">{LOCALE_SHORT[current]}</span>
        <ChevronIcon className="h-3 w-3" aria-hidden />
      </button>
      {open && (
        <ul
          role="listbox"
          className={`absolute end-0 z-50 min-w-40 rounded-lg border border-rule bg-paper text-ink shadow-[0_12px_32px_-12px_rgba(26,26,24,0.35)] ${
            drop === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {routing.locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === current}
                onClick={() => swap(l)}
                lang={l}
                dir={l === 'ar' ? 'rtl' : 'ltr'}
                className="w-full text-start min-h-11 px-3 py-2 text-body hover:bg-paper-2"
              >
                {LOCALE_LABELS[l]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
