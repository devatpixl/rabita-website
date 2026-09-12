'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { LanguageSwitcher } from './language-switcher';
import { LinkVT } from './link-vt';
import { cn } from '@/lib/cn';

// Five items, unchanged in count. What changed is the split: prayer used to
// share a heading with services ("Bønn og tjenester") and education held a
// top-level slot of its own for a single page. Prayer now stands alone and
// points straight at the times, which is what most visitors arrive for;
// services takes the freed slot and education sits under it, where a
// visitor looking for the school would actually think to look.
export const NAV_KEYS = ['project', 'apartments', 'prayer', 'services', 'teaching', 'visit', 'about'] as const;
export type NavKey = (typeof NAV_KEYS)[number];

// null means "opens a menu and goes nowhere itself".
//
// `teaching` is the one (client, 2026-09-12: "legge til undervisning etter
// tjeneste"). /undervisning was retired on 2026-09-10 at the client's own
// instruction because it duplicated four service pages, so the item has no
// page to point at — and pointing it at /tjenester would light the active
// rule under two items at once. It is a trigger for its own submenu
// instead, which is all the request needs. If a landing page is wanted
// later, give it a root here and the button becomes a link again.
export const NAV_ROOT: Record<NavKey, string | null> = {
  project: '/moskeprosjektet',
  apartments: '/moskeprosjektet/leiligheter',
  prayer: '/bonnetider',
  services: '/tjenester',
  teaching: null,
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
  // A heading without children (none today; Prayer gained its own list on
  // 2026-08-30) is a plain link. Opening an
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

  const isCurrent = (key: NavKey) => {
    const root = NAV_ROOT[key];
    // A menu-only item is never the current page, because it is not one.
    if (!root) return false;
    return (
      pathname.startsWith(`/${locale}${root}`) &&
      !(key === 'project' && pathname.startsWith(`/${locale}${NAV_ROOT.apartments}`))
    );
  };

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
        // 16px, down from 20 (2026-09-12). The row is justify-between over
        // three children, so a seventh nav item ate the slack: measured at
        // 1280 through 1680 the gap between "Om oss" and the Bli medlem pill
        // was exactly 0 — not overlapping, but touching. Six gaps at 4px
        // less puts 24px back.
        style={{ gap: '16px' }}
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
              {/* One appearance, two elements. An item with a root is a
                 link; `teaching` has none, so it is a button that only opens
                 its menu. TypeScript does not catch the difference — a null
                 interpolated into a template string becomes the text "null",
                 so the link would have quietly pointed at /no/null. */}
              {(() => {
                const root = NAV_ROOT[key];
                const shared = cn(
                  // 14px and text-ink-60, the innocents.no recipe (13px /
                  // weight 500 / opacity .82) in Rabita's palette. At full
                  // text-ink the five links carried the same weight as the
                  // wordmark and the header had no hierarchy — recessing
                  // them puts the order back: lockup, then action, then
                  // navigation.
                  'relative block whitespace-nowrap py-2 font-sans text-[14px] font-medium tracking-[-0.005em] transition-colors duration-200',
                  active || isCurrent(key) ? 'text-gold-deep' : 'text-ink-60 hover:text-gold-deep',
                );
                const inner = (
                  <>
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
                  </>
                );
                return root ? (
                  <LinkVT
                    href={`/${locale}${root}`}
                    aria-expanded={hasMenu(key) ? active : undefined}
                    aria-current={isCurrent(key) ? 'page' : undefined}
                    onFocus={() => open(key)}
                    className={shared}
                  >
                    {inner}
                  </LinkVT>
                ) : (
                  <button
                    type="button"
                    aria-expanded={active}
                    onFocus={() => open(key)}
                    onClick={() => (active ? close() : open(key))}
                    className={shared}
                  >
                    {inner}
                  </button>
                );
              })()}

              {/* The panel now hangs off the item that opens it, not off the
                 header (client, 2026-09-12: "why such a big width, make it
                 fit to longest word"). It used to be inset-x-0 with an inner
                 max-w-[84rem] card, which was right when it held thirteen
                 items in three columns each carrying a sentence. Against one
                 column of keywords that was a 1344px card holding a 200px
                 list.
                 
                 w-max sizes it to its longest label. start-0 anchors it to
                 the item, and mirrors itself in Arabic.

                 pt-[10px] rather than a margin: the gap between the label
                 and the card has to be part of the hoverable area, or the
                 pointer crosses dead space on the way down and the menu
                 shuts. And because the card is now a DESCENDANT of the item,
                 mouseleave on <nav> cannot fire while the pointer is inside
                 it — moving from label to card is no longer a hover problem
                 to be defended against. */}
              <AnimatePresence>
                {active && hasMenu(key) && (
                  <motion.div
                    key="panel"
                    initial={reduced ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    onMouseEnter={clear}
                    className="absolute start-0 top-full z-40 hidden pt-[10px] md:block"
                  >
                    <div className="w-max min-w-[13rem] rounded-2xl border border-rule bg-paper px-4 py-2 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.4)]">
                      <MegaPanel navKey={key} onNavigate={() => setOpenKey(null)} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </nav>

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
      {/* The "Se alt i Tjenester" row that sat here is gone (client,
         2026-09-12). It pointed at NAV_ROOT[navKey] — the same destination
         as the nav item the reader is already hovering in order to see this
         panel — so it was a link back to the thing that opened it. His mock
         of this menu starts straight at the first service. */}
      {/* One column (client's mock, 2026-09-12). Three columns were there to
         absorb thirteen items each carrying a sentence; the longest list is
         nine keywords now, which is a shorter panel in one column than the
         old one was in three. */}
      <ul className="grid gap-y-0">
        {items.map((item) => (
          <li key={item.href}>
            <LinkVT
              href={`/${locale}${item.href}`}
              onClick={onNavigate}
              className="group block border-t border-rule py-2 transition-colors hover:border-gold-deep"
            >
              {/* Keyword only, and a size down (client, 2026-09-12: "det
                 skal kun være stikkord og mindre"). The sentence under each
                 label is gone — thirteen of them turned the Tjenester panel
                 into a page of prose you had to read to navigate. The blurbs
                 are still in the message files and still carry the services
                 index; nothing was deleted to do this.

                 The phone drawer has always listed labels only, so this
                 brings the desktop panel into line with it rather than
                 inventing a treatment. */}
              <span className="flex items-baseline justify-between gap-4">
                <span className="font-serif text-[0.95rem] text-ink transition-colors group-hover:text-gold-deep">
                  {item.label}
                </span>
                <span
                  aria-hidden
                  className="shrink-0 text-ink-60 transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                >
                  &rarr;
                </span>
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
  const [mounted, setMounted] = useState(false);
  // Which section has its sub-items showing. One at a time — a phone drawer
  // that can have all five open again is the wall of links we just left.
  const [expanded, setExpanded] = useState<NavKey | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Collapse the sections again once the drawer is shut, so reopening it
  // always starts at the five headings rather than wherever you last were.
  useEffect(() => {
    if (!open) setExpanded(null);
  }, [open]);

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
      {/* Trigger: 44x44, three 2px bars, morphing to an X while the drawer is
         open. It was 11x11 with two hairlines, which is under the 44px touch
         minimum and gave no feedback that it had opened anything.

         xl:hidden, not md:hidden. The desktop nav now starts at 1280, and
         this button was still retiring at 768, so between those two widths
         the site had no navigation at all. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t('closeMenu') : t('openMenu')}
        aria-expanded={open}
        className="-me-2 grid h-11 w-11 place-items-center xl:hidden"
      >
        <span aria-hidden className="relative block h-[14px] w-[22px]">
          <span
            className={cn(
              'absolute inset-x-0 top-0 block h-[2px] rounded bg-ink transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
              open && 'translate-y-[6px] rotate-45',
            )}
          />
          <span
            className={cn(
              'absolute inset-x-0 bottom-0 block h-[2px] rounded bg-ink transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
              open && '-translate-y-[6px] -rotate-45',
            )}
          />
        </span>
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="mobile-nav"
                className="fixed inset-0 z-[60] xl:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  type="button"
                  aria-label={t('closeMenu')}
                  onClick={() => setOpen(false)}
                  className="absolute inset-0 bg-ink/60"
                />
                {/* Full bleed on a phone, a panel on a tablet. Dusk ground,
                   not paper: the drawer is a place you go, and the site
                   already uses dusk for every full stop. 100dvh so an iOS
                   URL bar collapse cannot crop the actions at the foot. */}
                <motion.div
                  className="absolute inset-y-0 end-0 flex h-full w-full flex-col bg-dusk text-paper sm:w-[26rem]"
                  style={{ height: '100dvh' }}
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                >
                  <div className="flex shrink-0 items-center justify-between px-5 py-4">
                    <span className="flex flex-col font-serif leading-tight">
                      <span className="text-[15px] font-medium text-paper">{t('orgName')}</span>
                      <span className="text-[13px] italic text-paper/55">{t('wordmark')}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label={t('closeMenu')}
                      className="-me-2 grid h-11 w-11 place-items-center rounded-full text-[26px] leading-none text-paper/70 transition-colors hover:bg-paper/10 hover:text-paper"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Main categories only, sub-pages folded behind a chevron
                     (client, 2026-08-30). Eighteen links stacked open turned
                     the drawer into a scroll of its own on a phone. Nothing is
                     gone: the heading still navigates in one tap, and the
                     chevron opens its pages without leaving the drawer. */}
                  <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-8">
                    <div className="border-t border-paper/15 pt-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
                        {t('openDaily')}
                      </p>
                      <p className="mt-1 font-mono text-[14px] tracking-[0.06em] text-paper/80">
                        {t('openHours')}
                      </p>
                    </div>

                    {NAV_KEYS.map((key) => {
                      const items = (t.raw(`menu.${key}`) as Item[]) ?? [];
                      const isOpen = expanded === key;
                      return (
                        <div key={key} className="border-t border-paper/15 first:mt-5">
                          <div className="flex items-center">
                            {/* Same split as the bar: a rootless item opens
                               its own list instead of navigating. */}
                            {NAV_ROOT[key] ? (
                              <LinkVT
                                href={`/${locale}${NAV_ROOT[key]}`}
                                onClick={() => setOpen(false)}
                                className="flex min-h-14 flex-1 items-center font-serif text-[22px] leading-tight text-paper transition-colors hover:text-gold"
                              >
                                {t(`items.${key}`)}
                              </LinkVT>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setExpanded(isOpen ? null : key)}
                                aria-expanded={isOpen}
                                className="flex min-h-14 flex-1 items-center text-start font-serif text-[22px] leading-tight text-paper transition-colors hover:text-gold"
                              >
                                {t(`items.${key}`)}
                              </button>
                            )}
                            {items.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setExpanded(isOpen ? null : key)}
                                aria-expanded={isOpen}
                                aria-label={`${t(`items.${key}`)} – ${t('overview')}`}
                                className="-me-2 grid h-11 w-11 shrink-0 place-items-center text-paper/60 transition-colors hover:text-gold"
                              >
                                <ChevronIcon
                                  className={cn(
                                    'h-4 w-4 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
                                    isOpen && 'rotate-180',
                                  )}
                                />
                              </button>
                            )}
                          </div>
                          <AnimatePresence initial={false}>
                            {isOpen && items.length > 0 && (
                              <motion.ul
                                key="sub"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden"
                              >
                                {items.map((item) => (
                                  <li key={item.href} className="border-t border-paper/10">
                                    <LinkVT
                                      href={`/${locale}${item.href}`}
                                      onClick={() => setOpen(false)}
                                      className="flex min-h-12 items-center ps-4 font-serif text-[16px] text-paper/70 transition-colors hover:text-gold"
                                    >
                                      {item.label}
                                    </LinkVT>
                                  </li>
                                ))}
                                <li className="h-2" />
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions pinned to the foot, in thumb reach, with the iOS
                     home indicator accounted for. */}
                  <div
                    className="shrink-0 border-t border-paper/15 px-5 pt-4"
                    style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
                  >
                    <div className="flex items-center gap-3">
                      <LinkVT
                        href={`/${locale}/bli-medlem`}
                        onClick={() => setOpen(false)}
                        className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-paper/35 px-4 text-[14px] font-semibold text-paper"
                      >
                        {t('join')}
                      </LinkVT>
                      <LinkVT
                        href={`/${locale}/gi-en-gave`}
                        onClick={() => setOpen(false)}
                        className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-gold px-4 text-[14px] font-semibold text-dusk"
                      >
                        {t('give')}
                      </LinkVT>
                    </div>
                    <div className="mt-3 flex justify-center">
                      <LanguageSwitcher tone="paper" drop="up" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

// Chevron for the mobile accordion. Same 1.8 stroke and round caps as the
// arrows elsewhere in the chrome, so it belongs to the same set.
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
