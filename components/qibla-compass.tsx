'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { OSLO_QIBLA_BEARING, qiblaBearing } from '@/lib/qibla';

// Pass 3E jewel — Qibla compass in the footer. Points to Mecca from the
// visitor's location when granted, from Oslo otherwise. Rendered as
// jewelry (40px), never as a feature. ~40 lines total, zero dependencies
// beyond the pure bearing utility.

type Source = 'oslo' | 'user';

export function QiblaCompass() {
  const t = useTranslations('qibla');
  const [bearing, setBearing] = useState<number>(OSLO_QIBLA_BEARING);
  const [source, setSource] = useState<Source>('oslo');

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    // Only ask for permission on first render; we do not push a prompt if
    // the user has previously denied.
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        const b = qiblaBearing(pos.coords.latitude, pos.coords.longitude);
        setBearing(b);
        setSource('user');
      },
      () => {
        // Permission denied / unavailable — keep Oslo bearing.
      },
      { enableHighAccuracy: false, timeout: 3_000, maximumAge: 60 * 60_000 },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const rounded = Math.round(bearing);

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 40 40" className="h-10 w-10 text-ink" aria-hidden>
        {/* Dial */}
        <circle
          cx={20}
          cy={20}
          r={18}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.35}
          strokeWidth={1}
        />
        {/* Cardinal ticks */}
        {[0, 90, 180, 270].map((deg) => (
          <line
            key={deg}
            x1={20}
            y1={4}
            x2={20}
            y2={7}
            stroke="currentColor"
            strokeWidth={1}
            transform={`rotate(${deg} 20 20)`}
            opacity={deg === 0 ? 0.9 : 0.4}
          />
        ))}
        {/* Needle */}
        <g
          style={{
            transform: `rotate(${bearing}deg)`,
            transformOrigin: '20px 20px',
            transition: 'transform 800ms cubic-bezier(0.2,0.7,0.2,1)',
          }}
        >
          <line
            x1={20}
            y1={20}
            x2={20}
            y2={7}
            stroke="#C0A165"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <circle cx={20} cy={20} r={1.5} fill="#C0A165" />
        </g>
      </svg>
      <div className="flex flex-col leading-tight">
        <span
          className="text-[13px] font-semibold text-ink"
          aria-live="polite"
        >
          {t('qibla')} · <span className="tabular-nums">{rounded}°</span>
        </span>
        <span className="text-[11px] text-ink-60">
          {source === 'user' ? t('fromHere') : t('fromOslo')}
        </span>
      </div>
    </div>
  );
}
