'use client';

import { useEffect, useState } from 'react';
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
    <div
      role="dialog"
      aria-live="polite"
      aria-labelledby="consent-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-rule bg-paper shadow-lg"
    >
      <div className="shell py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p id="consent-title" className="font-serif text-card text-ink">
              {t('title')}
            </p>
            <p className="mt-1 text-body text-ink-60">{t('body')}</p>
            {detailOpen && (
              <div className="mt-4 space-y-3 border-t border-rule pt-4 text-body text-ink">
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked disabled className="mt-1 h-5 w-5 accent-ink" />
                  <div>
                    <p className="font-semibold">{t('categories.essential.name')}</p>
                    <p className="text-ink-60">{t('categories.essential.body')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={measurement}
                    onChange={(e) => setMeasurement(e.target.checked)}
                    className="mt-1 h-5 w-5 accent-ink"
                  />
                  <div>
                    <p className="font-semibold">{t('categories.measurement.name')}</p>
                    <p className="text-ink-60">{t('categories.measurement.body')}</p>
                  </div>
                </div>
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
    </div>
  );
}
