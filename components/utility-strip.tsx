'use client';

import { useTranslations } from 'next-intl';

import { useEffect, useRef } from 'react';
import { PrayerTimesWidget } from './prayer-times-widget';
import { LanguageSwitcher } from './language-switcher';
import { PrayerPanelBody } from './prayer-panel-body';
import { usePrayerPanel } from './prayer-panel-provider';

// Above the logo, scrolls away (§2). On --paper-deep.
//
// ── VISIBLE ON PHONES SINCE 2026-09-22 ────────────────────────────────────
// It was `hidden md:block` from the start, which meant the whole strip — and
// therefore every prayer time in the page chrome — did not exist below 768px.
// The nav's own compact trigger is `min-[1800px]:block` and its "Bønnetider"
// ghost button is `lg:inline-flex`, so nothing covered for it: a phone
// landing on any page saw no prayer time at all. That is the gap behind the
// client's 2026-09-22 note, and see prayer-times-widget.tsx for the rail that
// now fills the strip.
//
// Height is no longer fixed at 44px: `min-h-11` applies from md only, because
// the rail wraps to two rows of three on a phone and must be allowed to.
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
  // Mirrors stripInView so the observer can apply hysteresis without
  // re-subscribing every time the value changes.
  const lastRef = useRef(true);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // Fire once at mount so the initial state is correct even before a
    // scroll happens.
    //
    // Hysteresis, deliberately. A single boundary (the old `threshold: 0`
    // with a -12px margin) flips the moment the strip's edge crosses one
    // line, so scrolling slowly across that line toggles the whole header
    // between full-width and capsule repeatedly. Leaving and returning now
    // use different lines — out at 12px, back only at 36px — so the seam
    // cannot oscillate. Multiple thresholds are needed because an observer
    // only reports at crossings, and we need position samples between them.
    const io = new IntersectionObserver(
      ([entry]) => {
        const bottom = entry.boundingClientRect.bottom;
        const next = lastRef.current ? bottom > 12 : bottom > 36;
        if (next !== lastRef.current) {
          lastRef.current = next;
          setStripInView(next);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [setStripInView]);

  return (
    <div
      ref={rootRef}
      data-prayer-panel-scope
      data-print-hide
      className="relative block border-b border-gold bg-paper-deep"
    >
      <div className="mx-auto flex w-full max-w-[84rem] items-center justify-between gap-6 px-4 md:min-h-11 md:px-10 lg:px-12">
        <PrayerTimesWidget />
      </div>
      {open && stripInView && (
        <div className="border-t border-rule">
          <PrayerPanelBody />
        </div>
      )}
    </div>
  );
}
