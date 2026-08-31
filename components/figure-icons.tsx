// The marks that sit beside a figure.
//
// Shared between the homepage ledger (project-overview.tsx), where they sit in
// diamonds over the render, and the mosque-project key figures, where they sit
// in square chips on paper. One set so a "floors" mark cannot mean one thing on
// the homepage and another two clicks in.
//
// Line drawings at 18px, matched in weight to the mono labels beside them:
// anything heavier and the icon reads louder than the figure it belongs to.

export type FigureIconName =
  | 'building'
  | 'floors'
  | 'people'
  | 'person'
  | 'calendar'
  | 'check';

export function FigureIcon({
  name,
  className,
}: {
  name: FigureIconName;
  className?: string;
}) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };

  if (name === 'building') {
    return (
      <svg {...common}>
        <path d="M4 21V7l7-4 7 4v14" />
        <path d="M2 21h20" />
        <path d="M8 21v-4h6v4M8 10h.01M12 10h.01M8 13.5h.01M12 13.5h.01" />
      </svg>
    );
  }

  if (name === 'floors') {
    return (
      <svg {...common}>
        <path d="M3 8h8V4M3 8v4h6M9 12v4h6M15 16v4h6V4h-6" />
      </svg>
    );
  }

  if (name === 'people') {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-1a6 6 0 0 1 12 0v1" />
        <path d="M16 5.5a3 3 0 0 1 0 5.5M17 14.5a5 5 0 0 1 4 4.5v1" />
      </svg>
    );
  }

  if (name === 'person') {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5.5 20v-1a6.5 6.5 0 0 1 13 0v1" />
      </svg>
    );
  }

  if (name === 'check') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.3l2.5 2.4 4.5-5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" />
    </svg>
  );
}
