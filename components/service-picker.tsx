'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ServiceKey } from '@/lib/services';
import { cn } from '@/lib/cn';

// The "rullegardin" the client asked for on each of the two service pages
// (2026-09-13: "hver side har en rullegardin og en beskrivende tekst").
//
// It is a DISCLOSURE OF LINKS, not a listbox or a <select>. Every option does
// one thing — jump to a band further down this same page — so the options are
// anchors, and a button + <ul> of <a> is both the simplest correct markup and
// the accessible one. A fake listbox here would mean re-implementing roving
// focus, typeahead and selection state for a menu whose every item is a link.
//
// Why a jump list earns its place: the index is one tall band per service, so
// the ten on /tjenester run several screens deep. The dropdown is the only way
// to see the whole list at once and get to the sixth without scrolling past
// five.
//
// Closes on Escape, on outside pointerdown, and on choosing an option. Focus
// returns to the trigger on Escape only — after a jump the reader wants to be
// where they landed, not back at the top.
export function ServicePicker({
  items,
  className,
}: {
  items: readonly ServiceKey[];
  className?: string;
}) {
  const t = useTranslations('servicesIndex');
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      trigger.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <div ref={wrap} className={cn('relative', className)}>
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center justify-between gap-4 rounded-full border border-rule bg-paper px-5 py-3 text-start transition-colors hover:border-gold-deep/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep/50 sm:w-auto sm:min-w-[20rem]"
      >
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold-deep">
          {t('jumpTo')}
        </span>
        <span
          aria-hidden
          className={cn(
            'shrink-0 text-[0.7rem] text-gold-deep transition-transform duration-200 motion-reduce:transition-none',
            open && 'rotate-180',
          )}
        >
          ▾
        </span>
      </button>

      {/* hidden, not unmounted: the list stays in the markup so it is findable
         and so a jump link still works if hydration never happens. */}
      <ul
        id={panelId}
        hidden={!open}
        className="absolute z-20 mt-2 max-h-[min(60vh,26rem)] w-full overflow-y-auto rounded-2xl border border-rule bg-paper py-1 shadow-[0_18px_40px_-24px_rgba(22,36,46,0.45)] sm:w-[22rem]"
      >
        {items.map((key) => (
          <li key={key}>
            <a
              href={`#${key}`}
              onClick={() => setOpen(false)}
              className="block border-b border-rule/60 px-5 py-3 font-serif text-[1.02rem] leading-snug text-ink transition-colors last:border-0 hover:bg-paper-2 hover:text-gold-deep focus-visible:bg-paper-2 focus-visible:outline-none"
            >
              {/* t.raw, not t: the titles carry <em> for the accent face, and
                 t() parses that as a tag and throws without a handler. The
                 option row wants the plain words — <em> set half a 1rem line
                 in the accent face, which reads as emphasis on a list where
                 nothing is emphasised. */}
              {String(t.raw(`items.${key}.title`)).replace(/<\/?em>/g, '')}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
