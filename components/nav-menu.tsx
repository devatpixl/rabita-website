'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { LinkVT } from './link-vt';
import { cn } from '@/lib/cn';

// Five items, unchanged in count. What changed is the split: prayer used to
// share a heading with services ("Bønn og tjenester") and education held a
// top-level slot of its own for a single page. Prayer now stands alone and
// points straight at the times, which is what most visitors arrive for;
// services takes the freed slot and education sits under it, where a
// visitor looking for the school would actually think to look.
export const NAV_KEYS = ['project', 'prayer', 'services', 'visit', 'about'] as const;
export type NavKey = (typeof NAV_KEYS)[number];

export const NAV_ROOT: Record<NavKey, string> = {
  project: '/moskeprosjektet',
  prayer: '/bonnetider',
  services: '/tjenester',
  visit: '/besok-oss',
  about: '/om-oss',
};

type Item = { label: string; blurb: string; href: string };

// Desktop nav. Hover opens a panel; the gold rule slides between headings and closing is delayed.
export function DesktopNav() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const reduced = useReducedMotion();

  const [openKey, setOpenKey] = useState<NavKey | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  const clear = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  // Prayer has no children — it is a direct link to the times. Opening an
  // empty panel under it would flash a blank card on hover.
  const hasMenu = (key: NavKey) =>
    ((t.raw(`menu.${key}`) as Item[] | undefined) ?? []).length > 0;

  const open = (key: NavKey) => {
    clear();
    setOpenKey(hasMenu(key) ? key : null);
  };
  const close = () => {
    clear();
    closeTimer.current = setTimeout(() => setOpenKey(null), 140);
  };

  useEffect(() => () => clear(), []);
  // a heading is a link as well as a trigger, so the panel has to go when the route does
  useEffect(() => {
    setOpenKey(null);
  }, [pathname]);

  useEffect(() => {
    if (!openKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenKey(null);
    };
    const onClick = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpenKey(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClick);
    };
  }, [openKey]);

  const isCurrent = (key: NavKey) => pathname.startsWith(`/${locale}${NAV_ROOT[key]}`);

  return (
    <div ref={wrap} className="hidden xl:contents">
      {/* flex-none, with no margin of its own. The header row is
         justify-between, so the two gaps around this nav are equal and are
         set by the row, not by a margin here. An ms-8 would make the left
         gap smaller than the right one and reintroduce exactly the lopsided
         bar this replaced.

         Gap between items is 20px. innocents.no runs a 6px gap plus 6px of
         padding either side of each trigger, which is 18px of optical space;
         Rabita has no horizontal padding on its items, so 20px is the same
         measure. */}
      <nav
        aria-label="Primary"
        className="hidden xl:flex flex-none items-center"
        style={{ gap: '20px' }}
        onMouseLeave={close}
      >
        {NAV_KEYS.map((key, i) => {
          const active = openKey === key;
          return (
            <motion.div
              key={key}
              className="group relative"
              onMouseEnter={() => open(key)}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <LinkVT
                href={`/${locale}${NAV_ROOT[key]}`}
                aria-expanded={hasMenu(key) ? active : undefined}
                aria-current={isCurrent(key) ? 'page' : undefined}
                onFocus={() => open(key)}
                className={cn(
                  // 14px and text-ink-60, the innocents.no recipe (13px /
                  // weight 500 / opacity .82) in Rabita's palette. At full
                  // text-ink the five links carried the same weight as the
                  // wordmark and the header had no hierarchy — recessing
                  // them puts the order back: lockup, then action, then
                  // navigation.
                  'relative block whitespace-nowrap py-2 font-sans text-[14px] font-medium tracking-[-0.005em] transition-colors duration-200',
                  active || isCurrent(key) ? 'text-gold-deep' : 'text-ink-60 hover:text-gold-deep',
                )}
              >
                {/* No 01/02/03. A number implies a sequence and these are
                   not one — nobody reads a nav in order. It also cost the
                   labels 20px each of horizontal room the bar did not have
                   at 13-14 inches. */}
                <span className="block transition-transform duration-200 group-hover:-translate-y-px">
                  {t(`items.${key}`)}
                </span>
                {(active || isCurrent(key)) && (
                  <motion.span
                    layoutId={reduced ? undefined : 'nav-rule'}
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 block h-[1.5px] bg-gold-deep"
                    transition={{ type: 'spring', stiffness: 520, damping: 42 }}
                  />
                )}
              </LinkVT>
            </motion.div>
          );
        })}
      </nav>

      <AnimatePresence>
        {openKey && (
          <motion.div
            key="mega"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={clear}
            onMouseLeave={close}
            className="absolute inset-x-0 top-full hidden md:block"
          >
            <div className="mx-auto mt-[6px] w-full max-w-[84rem] rounded-3xl border border-rule bg-paper px-9 py-4 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.4)]">
              <MegaPanel navKey={openKey} onNavigate={() => setOpenKey(null)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MegaPanel({ navKey, onNavigate }: { navKey: NavKey; onNavigate: () => void }) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const reduced = useReducedMotion();
  const items = t.raw(`menu.${navKey}`) as Item[];

  return (
    <motion.div
      key={navKey}
      initial={reduced ? false : { opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-ink-60">
        {t('overview')} {t(`items.${navKey}`)}
      </p>
      <ul className="mt-3 grid gap-x-10 gap-y-0 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.href}>
            <LinkVT
              href={`/${locale}${item.href}`}
              onClick={onNavigate}
              className="group block border-t border-rule py-2 transition-colors hover:border-gold-deep"
            >
              <span className="flex items-baseline justify-between gap-4">
                <span className="font-serif text-[1.05rem] text-ink transition-colors group-hover:text-gold-deep">
                  {item.label}
                </span>
                <span
                  aria-hidden
                  className="shrink-0 text-ink-60 transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                >
                  &rarr;
                </span>
              </span>
              <span className="mt-0.5 block text-[0.85rem] leading-snug text-ink-60">
                {item.blurb}
              </span>
            </LinkVT>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// Mobile nav. There was none below md, so a phone could only reach the home page.
export function MobileNav() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<NavKey | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('openMenu')}
        aria-expanded={open}
        className="-me-2 grid h-11 w-11 place-items-center md:hidden"
      >
        <span aria-hidden className="block h-px w-6 bg-ink" />
        <span aria-hidden className="mt-[6px] block h-px w-6 bg-ink" />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="mobile-nav"
                className="fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label={t('closeMenu')}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/50"
            />
            <motion.div
              className="absolute inset-y-0 end-0 flex w-[min(22rem,88vw)] flex-col overflow-y-auto bg-paper"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            >
              <div className="flex items-center justify-between border-b border-rule px-5 py-3">
                <span className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-ink-60">
                  {t('wordmark')}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t('closeMenu')}
                  className="grid h-11 min-w-11 place-items-center text-[0.9rem] text-ink-60 hover:text-ink"
                >
                  &times;
                </button>
              </div>

              <ul className="px-5 pb-10">
                {NAV_KEYS.map((key) => {
                  const items = t.raw(`menu.${key}`) as Item[];
                  const expanded = section === key;
                  const label = (
                    <span className="font-serif text-[1.1rem]">{t(`items.${key}`)}</span>
                  );
                  return (
                    <li key={key} className="border-b border-rule">
                      {/* Prayer has no children, so it is a link rather than a
                         drawer that opens on nothing. */}
                      {items.length === 0 ? (
                        <LinkVT
                          href={`/${locale}${NAV_ROOT[key]}`}
                          onClick={() => setOpen(false)}
                          className="flex min-h-14 w-full items-center justify-between gap-4 text-start text-ink"
                        >
                          {label}
                          <span aria-hidden className="text-ink-60 rtl:rotate-180">
                            &rsaquo;
                          </span>
                        </LinkVT>
                      ) : (
                      <button
                        type="button"
                        onClick={() => setSection(expanded ? null : key)}
                        aria-expanded={expanded}
                        className="flex min-h-14 w-full items-center justify-between gap-4 text-start text-ink"
                      >
                        {label}
                        <span
                          aria-hidden
                          className={cn(
                            'text-ink-60 transition-transform duration-200',
                            expanded && 'rotate-90',
                          )}
                        >
                          &rsaquo;
                        </span>
                      </button>
                      )}
                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            {items.map((item) => (
                              <li key={item.href}>
                                <LinkVT
                                  href={`/${locale}${item.href}`}
                                  onClick={() => setOpen(false)}
                                  className="flex min-h-12 items-center ps-4 text-[0.95rem] text-ink-60 hover:text-gold-deep"
                                >
                                  {item.label}
                                </LinkVT>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
