'use client';

import type { MouseEvent, ReactNode } from 'react';
import { openGiveSheet } from './giving-sheet';

// A link that opens the site-wide giving sheet in place instead of leaving
// the page (user, 2026-10-11, on /bli-medlem's «Vil du gi mer enn
// medlemskapet?» row: "don't redirect to /gi-en-gave, instead open the
// donation card on same page"). Server components cannot attach onClick, so
// this is the one client wrapper they render. `href` stays on the element:
// without JavaScript, or when opened in a new tab, it still reaches
// /gi-en-gave.
export function GiveSheetLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    openGiveSheet();
  };
  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
