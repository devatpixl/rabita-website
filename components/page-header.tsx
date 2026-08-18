import type { ReactNode } from 'react';
import { Eyebrow } from './primitives';

// Shared page header for inner pages. Eyebrow + display headline + optional
// standfirst. Kept tight — no ornaments, no illustration, just typography.
export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <header className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-section-md">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-3 font-serif text-display text-ink">{title}</h1>
        {lede && (
          <p className="mt-6 max-w-prose text-body text-ink-60">{lede}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
      <div className="mx-auto max-w-6xl px-6">
        <hr className="border-rule" />
      </div>
    </header>
  );
}
