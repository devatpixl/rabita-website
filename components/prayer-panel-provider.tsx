'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';

// Shared state for the prayer-times expanding panel.
//
// One panel body, two possible trigger locations (utility strip and
// sticky nav — mutually exclusive based on whether the strip is in the
// viewport). Provider holds:
//
//   • open state (single source of truth)
//   • stripInView (set by the strip's IntersectionObserver; drives
//     which trigger renders and which container the panel body is
//     mounted into)
//   • trigger refs for focus-return on close
//
// Closes on: Escape, outside click, route change.
// Focus: moves into the panel on open (handled inside PrayerPanelBody);
// returns to the currently-visible trigger on close.

export const PRAYER_PANEL_ID = 'prayer-panel';

type Ctx = {
  open: boolean;
  toggle: () => void;
  close: () => void;
  stripInView: boolean;
  setStripInView: (v: boolean) => void;
  registerStripTrigger: (el: HTMLButtonElement | null) => void;
  registerNavTrigger: (el: HTMLButtonElement | null) => void;
};

const PrayerPanelContext = createContext<Ctx | null>(null);

export function usePrayerPanel() {
  const ctx = useContext(PrayerPanelContext);
  if (!ctx) throw new Error('usePrayerPanel must be used inside PrayerPanelProvider');
  return ctx;
}

export function PrayerPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [stripInView, setStripInView] = useState(true);
  const pathname = usePathname();

  const stripTriggerRef = useRef<HTMLButtonElement | null>(null);
  const navTriggerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    // Return focus to whichever trigger is currently visible.
    // We defer to allow the DOM update to settle first.
    requestAnimationFrame(() => {
      const target = stripInView ? stripTriggerRef.current : navTriggerRef.current;
      target?.focus();
    });
  }, [stripInView]);

  const toggle = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  // Route change → close (no focus return; navigation removes the caller)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes with focus return
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  // Outside-click closes. Anything inside a `[data-prayer-panel-scope]`
  // element (the strip container OR the sticky header) is treated as
  // "inside" — clicks there don't close.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      if (e.target.closest('[data-prayer-panel-scope]')) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const registerStripTrigger = useCallback((el: HTMLButtonElement | null) => {
    stripTriggerRef.current = el;
  }, []);
  const registerNavTrigger = useCallback((el: HTMLButtonElement | null) => {
    navTriggerRef.current = el;
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      open,
      toggle,
      close,
      stripInView,
      setStripInView,
      registerStripTrigger,
      registerNavTrigger,
    }),
    [open, toggle, close, stripInView, registerStripTrigger, registerNavTrigger],
  );

  return (
    <PrayerPanelContext.Provider value={value}>
      {children}
    </PrayerPanelContext.Provider>
  );
}
