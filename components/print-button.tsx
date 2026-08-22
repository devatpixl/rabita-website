'use client';

// window.print() needs a browser, so this one control is a client island.
// The rest of the calendar is server-rendered, which keeps it indexable.
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="min-h-11 rounded-full bg-gold-deep px-5 py-2 text-[14px] font-semibold text-paper transition-colors hover:bg-ink"
    >
      {label}
    </button>
  );
}
