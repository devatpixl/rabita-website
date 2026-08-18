'use client';

import { useTranslations } from 'next-intl';

import { useEffect, useRef } from 'react';
import { PrayerTimesWidget } from './prayer-times-widget';
import { LanguageSwitcher } from './language-switcher';
import { PrayerPanelBody } from './prayer-panel-body';
import { usePrayerPanel } from './prayer-panel-provider';

// Above the logo, scrolls away (§2). On --paper-deep.
//
// This is now a client component because it (a) tracks its own
// viewport visibility via IntersectionObserver so the shared prayer
// panel provider knows which trigger to render, and (b) hosts the
// panel body inline when the strip is in the viewport and the panel
// is open.
//
// data-prayer-panel-scope marks this whole container as "inside" for
// the provider's outside-click detection.
//
// Height stays 44px (min-h-11) unchanged when the panel is closed;
// when open, the panel body appends BELOW the strip's flex row with
// a 1px --rule hairline seam, and pushes the nav + page content down.
export function UtilityStrip() {
  const tNav = useTranslations('nav');
  const { open, stripInView, setStripInView } = usePrayerPanel();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // Fire once at mount so the initial state is correct even before a
    // scroll happens.
    const io = new IntersectionObserver(
      ([entry]) => {
        setStripInView(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [setStripInView]);

  return (
    <div
      ref={rootRef}
      data-prayer-panel-scope
      className="relative hidden md:block border-b border-gold bg-paper-deep"
    >
      <div className="mx-auto w-full max-w-[112rem] px-6 md:px-10 lg:px-24 flex min-h-11 items-center justify-between gap-6">
        <PrayerTimesWidget />
        <div className="flex items-center gap-6">
          {/* the hours sit with the other practical details rather than
              beside the one button worth pressing */}
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.1em] text-ink-60 lg:inline">
            {tNav('openDaily')} 06:00–22:00
          </span>
          <LanguageSwitcher />
        </div>
      </div>
      {open && stripInView && (
        <div className="border-t border-rule">
          <PrayerPanelBody />
        </div>
      )}
    </div>
  );
}
