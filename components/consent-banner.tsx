'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

// §8 GDPR: granular consent as a first-class component, not a plugin
// default. Two categories only (essential is always on, analytics + ads
// grouped as "measurement"). No third-party scripts fire before consent.

const KEY = 'rabita:consent:v1';

type Consent = { measurement: boolean; ts: number };

function read(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Consent;
  } catch {
    return null;
  }
}

function write(c: Consent) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    // storage disabled — banner will re-show, which is the correct behaviour
  }
  window.dispatchEvent(new CustomEvent('rabita:consent', { detail: c }));
}

export function ConsentBanner() {
  const t = useTranslations('consent');
  const [visible, setVisible] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [measurement, setMeasurement] = useState(false);

  useEffect(() => {
    const c = read();
    if (!c) setVisible(true);
    else setMeasurement(c.measurement);
  }, []);

  const acceptAll = () => {
    write({ measurement: true, ts: Date.now() });
    setVisible(false);
  };
  const rejectAll = () => {
    write({ measurement: false, ts: Date.now() });
    setVisible(false);
  };
  const savePref = () => {
    write({ measurement, ts: Date.now() });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    // A card in the corner rather than a bar across the foot, sized to clear the hero buttons.
    <motion.div
      role="dialog"
      aria-live="polite"
      aria-labelledby="consent-title"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-0 z-50 w-full border-t border-rule bg-paper shadow-[0_24px_48px_-24px_rgba(0,0,0,0.35)] sm:bottom-4 sm:start-4 sm:w-[min(23rem,calc(100vw-2rem))] sm:rounded-lg sm:border"
    >
      <div className="px-4 py-3.5">
        <div className="flex flex-col gap-3">
          <div>
            <p id="consent-title" className="font-serif text-card text-ink">
              {t('title')}
            </p>
            <p className="mt-1 text-[0.85rem] leading-snug text-ink-60">{t('body')}</p>
            {detailOpen && (
              <div className="mt-4 space-y-3 border-t border-rule pt-4 text-body text-ink">
                <label className="flex min-h-11 items-start gap-3">
                  <input type="checkbox" checked disabled className="mt-1 h-5 w-5 accent-ink" />
                  <span>
                    <span className="block font-semibold">{t('categories.essential.name')}</span>
                    <span className="block text-ink-60">{t('categories.essential.body')}</span>
                  </span>
                </label>
                <label className="flex min-h-11 items-start gap-3">
                  <input
                    type="checkbox"
                    checked={measurement}
                    onChange={(e) => setMeasurement(e.target.checked)}
                    className="mt-1 h-5 w-5 accent-ink"
                  />
                  <span>
                    <span className="block font-semibold">{t('categories.measurement.name')}</span>
                    <span className="block text-ink-60">{t('categories.measurement.body')}</span>
                  </span>
                </label>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {detailOpen ? (
              <button type="button" onClick={savePref}
                className="min-h-11 rounded-btn bg-ink px-4 py-2 text-body font-semibold text-paper">
                {t('save')}
              </button>
            ) : (
              <>
                <button type="button" onClick={rejectAll}
                  className="min-h-11 rounded-btn border border-ink px-4 py-2 text-body font-semibold text-ink">
                  {t('rejectAll')}
                </button>
                <button type="button" onClick={acceptAll}
                  className="min-h-11 rounded-btn bg-ink px-4 py-2 text-body font-semibold text-paper">
                  {t('acceptAll')}
                </button>
              </>
            )}
            <button type="button" onClick={() => setDetailOpen((v) => !v)}
              className="min-h-11 rounded-btn px-4 py-2 text-body font-semibold text-ink underline underline-offset-4">
              {detailOpen ? t('less') : t('customise')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
