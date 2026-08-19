'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';

// The four assurances as a register, since they are all verifiable claims rather than paragraphs.

type Card = { key: 'tax' | 'accounts' | 'permit' | 'org'; href: string };

export function AssuranceRegister({
  cards,
  values,
}: {
  cards: Card[];
  values: { orgNr: string; founded: number; cap: string };
}) {
  const t = useTranslations('whereMoneyGoes');
  const reduced = useReducedMotion();
  const root = useRef<HTMLUListElement>(null);
  const live = useInView(root, { once: true, margin: '-12% 0px' });
  const still = reduced === true;

  return (
    <ul ref={root} className="mt-16">
      {cards.map((c, i) => (
        <li key={c.key} className="group relative">
          {/* The rule is the register line. It draws, then the row sits on it. */}
          <span aria-hidden className="block h-px w-full bg-rule/60">
            <motion.span
              className="block h-full bg-gold-deep/70"
              initial={{ width: still ? '100%' : 0 }}
              animate={{ width: live || still ? '100%' : 0 }}
              transition={{
                duration: still ? 0 : 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: still ? 0 : i * 0.12,
              }}
            />
          </span>

          <div className="grid gap-x-10 gap-y-3 py-8 md:grid-cols-12 md:items-baseline">
            <div className="flex items-baseline gap-4 md:col-span-3">
              <span className="font-mono text-label uppercase tracking-widest text-gold-deep">
                {(i + 1).toString().padStart(2, '0')}
              </span>
              <h3 className="font-serif text-[18px] font-semibold leading-tight text-ink">
                {t(`cards.${c.key}.title`)}
              </h3>
            </div>

            <p className="max-w-[46ch] text-[14px] leading-relaxed text-ink-60 md:col-span-6">
              {t(`cards.${c.key}.body`, {
                orgNr: values.orgNr,
                founded: values.founded,
                cap: values.cap,
              })}
            </p>

            <div className="flex items-baseline justify-between gap-6 md:col-span-3 md:justify-end">
              {/* The stamp: what this row is evidence of */}
              <span className="whitespace-nowrap rounded-chip border border-rule px-2 py-1 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-60">
                {t(`cards.${c.key}.stamp`)}
              </span>
              <Link
                href={c.href}
                className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-[14px] font-semibold text-gold-deep"
              >
                <span className="border-b border-rule pb-px transition-colors group-hover:border-gold-deep">
                  {t(`cards.${c.key}.cta`)}
                </span>
                <span
                  aria-hidden
                  className="transition-transform duration-300 ease-out group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            </div>
          </div>
        </li>
      ))}
      <li aria-hidden className="block h-px w-full bg-rule/60" />
    </ul>
  );
}
