'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { donorSlug, type DonorEntry, type Phase } from '@/lib/donor-wall';
import { cn } from '@/lib/cn';

// Client half of the donor wall. Owns:
//   - the "Finn et navn" search input
//   - the on-view fade+rise stagger, laid left-to-right so the wall
//     reads as courses being set rather than a random reveal
//   - the deep-link scroll-and-highlight for #navn-<slug> hashes
//
// The wall itself is a stack of phase courses. Within a course, blocks
// are inline-flex with wrap so rows are ragged like real coursing.
// Between courses, a full-width gold hairline carries the phase label
// so the seam between phases reads as construction, not as tabs.

type Course = {
  phase: Phase;
  label: string;
  entries: { entry: DonorEntry; absoluteIndex: number }[];
};

export function DonorWallBlocks({
  courses,
  searchPlaceholder,
  searchAriaLabel,
  anonymousAriaLabel,
}: {
  courses: Course[];
  searchPlaceholder: string;
  searchAriaLabel: string;
  anonymousAriaLabel: string;
}) {
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const total = useMemo(
    () => courses.reduce((n, c) => n + c.entries.length, 0),
    [courses],
  );

  // On-view trigger for the entry stagger. Once, then done. Reduced
  // motion shortcircuits to instant.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisible(true);
      return;
    }
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Honour a #navn-... deep link on mount: scroll into view, and set
  // it as the active search so the highlight ring picks it up.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash.startsWith('#navn-')) return;
    const id = hash.slice(1);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, []);

  const q = query.trim().toLowerCase();
  const hasQuery = q.length > 0;

  return (
    <div ref={rootRef}>
      <label className="mb-6 flex max-w-sm items-center gap-3 border-b border-rule pb-2">
        <SearchIcon />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchAriaLabel}
          className="w-full bg-transparent text-[14px] text-ink placeholder:text-ink-60 focus:outline-none"
        />
      </label>

      <div className="space-y-10">
        {courses.map((course) => (
          <section key={course.phase}>
            <div className="mb-5 flex items-baseline gap-4">
              <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-gold-deep">
                {course.label}
              </span>
              <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-gold/70 via-gold/25 to-gold/0" />
              <span className="font-mono text-[12px] tabular-nums text-ink-60">
                {course.entries.length}
              </span>
            </div>

            <ul className="flex flex-wrap gap-2">
              {course.entries.map(({ entry, absoluteIndex }) => (
                <li key={absoluteIndex}>
                  <NameBlock
                    entry={entry}
                    order={absoluteIndex}
                    total={total}
                    visible={visible}
                    query={q}
                    hasQuery={hasQuery}
                    anonymousAriaLabel={anonymousAriaLabel}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function NameBlock({
  entry,
  order,
  visible,
  query,
  hasQuery,
  anonymousAriaLabel,
}: {
  entry: DonorEntry;
  order: number;
  total: number;
  visible: boolean;
  query: string;
  hasQuery: boolean;
  anonymousAriaLabel: string;
}) {
  const delayMs = order * 25;
  const isMatch = !hasQuery
    ? false
    : !entry.anonymous && entry.name.toLowerCase().includes(query);
  const isDim = hasQuery && !isMatch;

  const style: React.CSSProperties = {
    opacity: visible ? (isDim ? 0.3 : 1) : 0,
    transform: visible ? 'translateY(0)' : 'translateY(8px)',
    transition: `opacity 400ms ease-out ${delayMs}ms, transform 400ms ease-out ${delayMs}ms`,
  };

  if (entry.anonymous) {
    return (
      <span
        role="img"
        aria-label={anonymousAriaLabel}
        className="inline-block min-h-[38px] min-w-[64px] rounded-[3px] border border-rule bg-paper-2"
        style={style}
      />
    );
  }

  const id = `navn-${donorSlug(entry.name)}`;
  return (
    <span
      id={id}
      className={cn(
        'inline-flex flex-col items-start rounded-[3px] border border-rule bg-paper px-3 py-2 leading-tight',
        isMatch && 'ring-2 ring-gold ring-offset-2 ring-offset-paper-deep',
      )}
      style={style}
    >
      <span className="text-[13.5px] text-ink">{entry.name}</span>
      {entry.qualifier && (
        <span className="mt-1 font-mono text-[12px] uppercase tracking-[0.08em] text-gold-deep">
          {entry.qualifier}
        </span>
      )}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-ink-60"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
