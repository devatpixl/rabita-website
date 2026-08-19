'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

// Days to the annual meeting, so the card is a convening notice rather than a date poster.

export function DaysUntil({ iso }: { iso: string }) {
  const t = useTranslations('membership');
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const calc = () => {
      const target = new Date(`${iso}T00:00:00`);
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      setDays(Math.round((target.getTime() - midnight.getTime()) / 86_400_000));
    };
    calc();
    const id = window.setInterval(calc, 3_600_000);
    return () => window.clearInterval(id);
  }, [iso]);

  if (days === null || days < 0) return null;

  return (
    <p className="mt-3 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-gold">
      {t('countdown', { n: days })}
    </p>
  );
}
