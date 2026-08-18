import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { SplitReveal } from './split-reveal';

// Small typography primitives so every section reads at the same rhythm
// without repeating the same wrappers everywhere.

// Editorial eyebrow with hairline bar. Mono type for newsroom register.
// Colour is inherited so the same primitive works on cream and dusk
// surfaces without a new variant.
export function Eyebrow({
  children,
  tone = 'gold',
  className,
}: {
  children: ReactNode;
  tone?: 'gold' | 'gold-deep' | 'paper' | 'ink';
  className?: string;
}) {
  const colour =
    tone === 'gold'
      ? 'text-gold'
      : tone === 'gold-deep'
      ? 'text-gold-deep'
      : tone === 'paper'
      ? 'text-paper'
      : 'text-ink';
  return (
    <p
      className={cn(
        'eyebrow-bar font-mono text-[0.75rem] uppercase tracking-[0.16em]',
        colour,
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  children,
  id,
  reveal = false,
  className,
}: {
  children: ReactNode;
  id?: string;
  // Opt-in character-mask reveal on view. Reserve for section-openers per
  // Pass 3A plan — rarity is what lets the move land.
  reveal?: boolean;
  className?: string;
}) {
  return (
    <h2 id={id} className={cn('font-serif text-section text-ink', className)}>
      {reveal && typeof children === 'string' ? (
        <SplitReveal text={children} />
      ) : (
        children
      )}
    </h2>
  );
}

export function SectionBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto max-w-6xl px-6', className)}>{children}</div>
  );
}

export function Section({
  id,
  tone = 'paper',
  children,
  className,
}: {
  id?: string;
  tone?: 'paper' | 'paper-2' | 'paper-deep';
  children: ReactNode;
  className?: string;
}) {
  const toneClass =
    tone === 'paper-2' ? 'bg-paper-2' : tone === 'paper-deep' ? 'bg-paper-deep' : 'bg-paper';
  return (
    <section id={id} className={cn('py-section-md', toneClass, className)}>
      {children}
    </section>
  );
}

// Numeric stat rendered at display size (§5 stat row). Tabular figures via
// html-level rule; component only adds typography.
export function Stat({
  value,
  label,
  align = 'start',
}: {
  value: string;
  label: string;
  align?: 'start' | 'center';
}) {
  return (
    <div className={cn('flex flex-col gap-2', align === 'center' && 'items-center text-center')}>
      <span className="font-serif text-display leading-none text-ink tabular-nums">
        {value}
      </span>
      <span className="text-[13px] text-ink-60">
        {label}
      </span>
    </div>
  );
}
