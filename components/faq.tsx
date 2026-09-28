import { cn } from '@/lib/cn';

// A ruled question-and-answer list on native <details>. The first entry is
// open on arrival, as in the client's mock (2026-09-18, the utmelding
// proposal): a list where every answer is hidden reads as a list of
// headings, and one open answer shows the reader what the rest will do.
//
// Native disclosure, no state: it works before hydration, the browser owns
// keyboard and screen-reader behaviour, and the page has nothing to
// remember. The marker is CSS — a plus that turns into a cross when open —
// drawn with two hairlines rather than a glyph so it sits on the same
// baseline in all three scripts.
export type FaqItem = { id: string; q: string; a: string };

export function Faq({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <div className={cn('divide-y divide-rule border-y border-rule', className)}>
      {items.map((item, i) => (
        <details key={item.id} className="group py-5" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-start font-semibold text-[1.02rem] leading-snug text-ink marker:content-none [&::-webkit-details-marker]:hidden">
            <span>{item.q}</span>
            <span
              aria-hidden
              className="relative h-5 w-5 shrink-0 text-ink-60 transition-colors group-hover:text-ink"
            >
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
              <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current transition-transform duration-200 group-open:scale-y-0" />
            </span>
          </summary>
          <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-ink-60">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
