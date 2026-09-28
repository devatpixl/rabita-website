'use client';

import type { ReactNode } from 'react';
import { openGiveSheet } from './giving-sheet';

// A button that opens the giving sheet from a server-rendered page.
//
// The site does not send anyone to /gi-en-gave: the header's "Gi en gave"
// opens the sheet in place (nav-bar.tsx), and that is the one way to give
// the chrome offers. A link to the page from a body button would have been
// the only such link on the site (user, 2026-09-28: "since we're not using
// the gi en gave page ... why redirect to that on this CTA?"). openGiveSheet
// is a client call, so this small client component carries it for pages
// that render on the server.
export function GiveSheetButton({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={() => openGiveSheet()} className={className}>
      {children}
    </button>
  );
}
