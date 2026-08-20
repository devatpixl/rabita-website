'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { LinkVT } from './link-vt';
import { cn } from '@/lib/cn';

export const NAV_KEYS = ['project', 'worship', 'education', 'visit', 'about'] as const;
export type NavKey = (typeof NAV_KEYS)[number];

export const NAV_ROOT: Record<NavKey, string> = {
  project: '/moskeprosjektet',
  worship: '/tjenester',
  education: '/undervisning',
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
  const open = (key: NavKey) => {
    clear();
    setOpenKey(key);
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
    <div ref={wrap} className="hidden md:contents">
      <nav
        aria-label="Primary"
        className="hidden md:flex items-center"
        style={{ marginInlineStart: '48px', gap: '28px' }}
        onMouseLeave={close}
      >
        {NAV_KEYS.map((key, i) => {
          const active = openKey === key;
          const index = String(i + 1).padStart(2, '0');
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
                aria-expanded={active}
                aria-current={isCurrent(key) ? 'page' : undefined}
                onFocus={() => open(key)}
                className={cn(
                  'relative block whitespace-nowrap py-2 font-sans text-[0.95rem] transition-colors duration-200',
                  active || isCurrent(key) ? 'text-gold-deep' : 'text-ink hover:text-gold-deep',
                )}
              >
                <span className="flex items-baseline gap-1.5">
                  <span
                    aria-hidden
                    className={cn(
                      'text-[0.72rem] tabular-nums transition-colors duration-200',
                      active || isCurrent(key) ? 'text-gold-deep' : 'text-gold-deep/60',
                    )}
                  >
                    {index}
                  </span>
                  <span className="transition-transform duration-200 group-hover:-translate-y-px">
                    {t(`items.${key}`)}
                  </span>
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
            className="absolute inset-x-0 top-full hidden border-b border-rule bg-paper shadow-[0_24px_48px_-32px_rgba(0,0,0,0.35)] md:block"
          >
            <div className="mx-auto w-full max-w-[112rem] px-6 md:px-10 lg:px-24 py-8">
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
      <ul className="mt-5 grid gap-x-10 gap-y-1 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.href}>
            <LinkVT
              href={`/${locale}${item.href}`}
              onClick={onNavigate}
              className="group block border-t border-rule py-4 transition-colors hover:border-gold-deep"
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
              <span className="mt-1 block text-[0.85rem] leading-relaxed text-ink-60">
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
                {NAV_KEYS.map((key, i) => {
                  const items = t.raw(`menu.${key}`) as Item[];
                  const expanded = section === key;
                  const index = String(i + 1).padStart(2, '0');
                  return (
                    <li key={key} className="border-b border-rule">
                      <button
                        type="button"
                        onClick={() => setSection(expanded ? null : key)}
                        aria-expanded={expanded}
                        className="flex min-h-14 w-full items-center justify-between gap-4 text-start text-ink"
                      >
                        <span className="flex items-baseline gap-2.5">
                          <span aria-hidden className="font-mono text-[0.6rem] tabular-nums text-gold-deep/70">
                            {index}
                          </span>
                          <span className="font-serif text-[1.1rem]">{t(`items.${key}`)}</span>
                        </span>
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
