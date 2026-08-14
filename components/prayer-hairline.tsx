'use client';

import { useEffect, useState } from 'react';
import { PRAYER_TIMES_TODAY } from '@/lib/campaign';

// A single 1px gold hairline that sits on the current-prayer row and
// slides its position as time crosses the next threshold. Astronomical
// gesture (retained from the cut orbital-clock idea) without abandoning
// the tabular utility.
//
// Consumer pattern: wrap this component around the prayer-times table
// rows OR mount it standalone; positioning is based on data-attributes
// on the rows so it can be composed with any table layout.

const ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

function currentPrayerKey(now: Date): (typeof ORDER)[number] {
  const t = now.getHours() * 60 + now.getMinutes();
  const times = ORDER.map((k) => {
    const [h, m] = PRAYER_TIMES_TODAY[k].split(':').map(Number);
    return { key: k, mins: h * 60 + m };
  });
  // Current = the highest whose start time has passed. If before Fajr,
  // wrap to Isha of the previous day (still on-screen as "the current
  // window").
  let cur = times[times.length - 1].key;
  for (const p of times) {
    if (t >= p.mins) cur = p.key;
  }
  return cur;
}

export function PrayerHairline() {
  const [active, setActive] = useState<(typeof ORDER)[number] | null>(null);

  useEffect(() => {
    const tick = () => setActive(currentPrayerKey(new Date()));
    tick();
    // Recompute every 30s — cheap and updates cleanly across boundaries.
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!active) return;
    // Find any element in the DOM marked with data-prayer=<key> and paint
    // a hairline overlay on it. Simpler than trying to portal a fixed
    // element into an existing table.
    const cells = document.querySelectorAll<HTMLElement>('[data-prayer]');
    cells.forEach((el) => {
      el.style.position = 'relative';
      const isActive = el.dataset.prayer === active;
      el.style.setProperty('--prayer-hairline', isActive ? '1' : '0');
    });
  }, [active]);

  return null;
}
