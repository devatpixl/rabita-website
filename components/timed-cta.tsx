'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { GIVE_COMPLETE_EVENT, openGiveSheet } from './giving-sheet';
import { VideoCard } from './video-card';
import { IMAM_WELCOME, WELCOME_PLACEHOLDER } from '@/lib/media';
import { cn } from '@/lib/cn';

// A timed, page-specific ask, centred.
//
// Built generic on purpose: the strategy meeting wants this mechanism on
// several high-traffic pages with copy tailored to each, so it takes a
// message namespace rather than hard-coding the prayer page's wording.
//
// A bottom-corner card was tried first and was wrong. A narration from the
// Prophet ﷺ pinned to the corner of a screen reads like a cookie banner —
// the placement tells the reader how much it matters before they read a
// word. Centre, on a blurred ground, gives it the weight it should have.
//
// Native <dialog> + showModal(), matching the giving sheet: the top layer
// beats any z-index, and focus trapping and Escape come for free rather
// than being reimplemented badly.
//
// Shows once, then stays quiet for a month. A regular asked on every visit
// stops being a donor and becomes someone with a complaint.

const DISMISS_DAYS = 30;
/** Query flag the giving sheet returns with, so the card can say thank you. */
const RETURN_FLAG = 'takk';
const EXIT_MS = 260;

type Quote = { text: string; source: string };

export function TimedCta({
  ns,
  storageKey,
  delayMs = 6000,
  amountNok = 10,
  showVideoInAsk = false,
}: {
  /** Message namespace holding `eyebrow`, `quotes[]`, `give`, `dismiss`. */
  ns: string;
  storageKey: string;
  delayMs?: number;
  amountNok?: number;
  /** Also show the imam's welcome on the ASK card, not only the thank-you.
     Off by default: this popup interrupts someone checking a prayer time,
     and a film is a heavier interruption than a hadith. */
  showVideoInAsk?: boolean;
}) {
  const t = useTranslations(ns);
  const tVideo = useTranslations('video');
  // Nothing has been filmed yet, so the card runs in placeholder mode: the
  // frame, a still and the play button are all there so the slot can be seen
  // and judged, but the button is inert and the corner reads "video coming".
  // The day IMAM_WELCOME stops being null in lib/media.ts, both cards below
  // become the real film with no edit here.
  const film = IMAM_WELCOME ?? WELCOME_PLACEHOLDER;
  const filmIsPlaceholder = IMAM_WELCOME === null;
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // `t` is not guaranteed to be referentially stable across renders. If the
  // arming effect below depended on it, any re-render would clear the pending
  // timer and start a new one, so a popup with a 6s delay could be pushed
  // back indefinitely and never appear. Read the quotes through a ref
  // instead, and let the effect depend only on values that genuinely change.
  const quotesRef = useRef<Quote[]>([]);
  quotesRef.current = (t.raw('quotes') as Quote[]) ?? [];
  const [quote, setQuote] = useState<Quote | null>(null);
  const [thanking, setThanking] = useState(false);
  const [entered, setEntered] = useState(false);

  const releaseScroll = useCallback(() => {
    document.documentElement.classList.remove('sheet-open');
  }, []);

  const remember = useCallback(() => {
    try {
      localStorage.setItem(storageKey, String(Date.now()));
    } catch {
      // storage blocked — it reappears next visit, which is the safe default
    }
  }, [storageKey]);

  const close = useCallback(
    (then?: () => void) => {
      remember();
      setEntered(false);
      window.setTimeout(() => {
        releaseScroll();
        dialogRef.current?.close();
        then?.();
      }, EXIT_MS);
    },
    [remember, releaseScroll],
  );

  // Arm the timer — unless we have just come back from the giving sheet, in
  // which case the card reopens immediately wearing its thank-you face.
  //
  // Read from window.location rather than useSearchParams: this page is
  // statically rendered, and useSearchParams would force a Suspense
  // boundary around a component that is already client-only and
  // mount-guarded. It also survives the round trip through the Vipps app,
  // which in-page state would not.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get(RETURN_FLAG) === '1') {
      setThanking(true);
      remember();
      // Drop the flag so a refresh or a shared link does not thank someone
      // who has not given anything.
      const url = new URL(window.location.href);
      url.searchParams.delete(RETURN_FLAG);
      window.history.replaceState({}, '', url.toString());
      return;
    }

    // In development the dismissal is ignored, so the popup can actually be
    // looked at while it is being designed. Dismissing it once otherwise
    // hides it for a month, which is right in production and useless locally.
    if (process.env.NODE_ENV !== 'development') {
      let dismissedAt = 0;
      try {
        dismissedAt = Number(localStorage.getItem(storageKey) ?? 0);
      } catch {
        dismissedAt = 0;
      }
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 864e5) return;
    }

    const timer = window.setTimeout(() => {
      // Chosen after mount, never during render: a random pick on the server
      // would not match the client and React would discard the markup.
      const quotes = quotesRef.current;
      if (quotes.length === 0) return;
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, storageKey, remember]);

  // A gift completed while we were closed. Reopen and thank them.
  //
  // This is the in-page path. The query-flag check above only runs on mount,
  // and router.push() to the same route does not remount — so without this
  // listener the thank-you only appeared if the visitor happened to reload.
  useEffect(() => {
    const onComplete = () => setThanking(true);
    window.addEventListener(GIVE_COMPLETE_EVENT, onComplete);
    return () => window.removeEventListener(GIVE_COMPLETE_EVENT, onComplete);
  }, []);

  // Open once there is something to show, then run the entrance on the next
  // frame so the transition has two states to move between.
  useEffect(() => {
    if (!quote && !thanking) return;
    const el = dialogRef.current;
    if (!el || el.open) return;
    el.showModal();
    // The scroll lock goes on a frame later, not now. When we reopen right
    // after the giving sheet closes, that sheet's own `close` event is a
    // QUEUED task — so its cleanup can run after this effect and strip the
    // lock back off while our dialog is still up. Deferring puts us last.
    const raf = requestAnimationFrame(() => {
      document.documentElement.classList.add('sheet-open');
      setEntered(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [quote, thanking]);

  // Escape closes a native dialog on its own, so catch the resulting event
  // to release the scroll lock and record the dismissal.
  //
  // Depends on quote/thanking, NOT just on `remember`: the dialog does not
  // render until one of those is set, so on mount `dialogRef.current` is
  // null. With stable deps this effect ran exactly once, against null, and
  // never again — the listener was never attached and `sheet-open` was
  // never removed, leaving the page unscrollable after any dismissal.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onClose = () => {
      releaseScroll();
      setEntered(false);
      remember();
    };
    el.addEventListener('close', onClose);
    return () => el.removeEventListener('close', onClose);
  }, [quote, thanking, remember, releaseScroll]);

  // 3. Last line of defence: never leave the document locked because this
  //    component went away while the dialog was open.
  useEffect(() => releaseScroll, [releaseScroll]);

  if (!quote && !thanking) return null;

  return (
    <dialog
      ref={dialogRef}
      data-print-hide
      aria-label={thanking ? t('thanksEyebrow') : t('eyebrow')}
      onClick={(e) => {
        if (e.target === dialogRef.current) close();
      }}
      className={cn(
        'm-auto w-[calc(100vw-2rem)] max-w-[34rem] bg-transparent',
        'transition-[opacity,transform] duration-[420ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]',
        'motion-reduce:transition-none',
        entered ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-[0.97] opacity-0',
      )}
    >
      <div className="relative overflow-hidden rounded-[1.75rem] border border-rule bg-paper px-8 py-10 text-center md:px-12 md:py-12">
        <button
          type="button"
          onClick={() => close()}
          aria-label={t('dismiss')}
          className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full text-ink-60 transition-colors hover:bg-paper-2 hover:text-ink"
        >
          <span aria-hidden className="text-[1.15rem] leading-none">&times;</span>
        </button>

        {/* Rabita's own geometric mark. The site's rule is that the building
           carries the ornament, so this is the one piece of decoration that
           is actually the organisation's rather than a borrowed flourish. */}
        <Image
          src="/logo/rabita-mark-256.png"
          alt=""
          width={48}
          height={48}
          className="mx-auto h-12 w-12"
        />

        {thanking ? (
          <>
            <p className="mt-6 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-gold-deep">
              {t('thanksEyebrow')}
            </p>
            <p className="mt-5 text-balance font-serif text-[clamp(1.4rem,2.6vw,1.75rem)] leading-[1.35] text-ink">
              {t('thanksTitle')}
            </p>
            <p className="mx-auto mt-4 max-w-[34ch] text-body text-ink-60">{t('thanksBody')}</p>
            {/* The imam's thank-you, once it has been filmed. Here rather
               than on the ask: the visitor has already given, so a film is
               a reward rather than an interruption. */}
            <VideoCard
              video={film}
              label={tVideo('imamWelcome')}
              placeholder={filmIsPlaceholder}
              className="mt-7 text-start"
            />
            <button
              type="button"
              onClick={() => close()}
              className="mt-9 min-h-[3.25rem] w-full rounded-full bg-gold-deep px-6 text-[15px] font-semibold text-paper transition-colors hover:bg-ink active:scale-[0.99]"
            >
              {t('thanksClose')}
            </button>
          </>
        ) : (
          <>
            <p className="mt-6 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-gold-deep">
              {t('eyebrow')}
            </p>

            <blockquote className="mt-5">
              <p className="text-balance font-serif text-[clamp(1.35rem,2.6vw,1.75rem)] leading-[1.38] text-ink">
                {quote!.text}
              </p>
              <footer className="mt-7 flex items-center justify-center gap-4">
                <span aria-hidden className="h-px w-8 bg-gold-deep/40" />
                <cite className="not-italic font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-60">
                  {quote!.source}
                </cite>
                <span aria-hidden className="h-px w-8 bg-gold-deep/40" />
              </footer>
            </blockquote>

            {showVideoInAsk && (
              <VideoCard
                video={film}
                label={tVideo('imamWelcome')}
                placeholder={filmIsPlaceholder}
                className="mt-7 text-start"
              />
            )}

            <button
              type="button"
              onClick={() =>
                close(() =>
                  openGiveSheet(
                    amountNok,
                    `${window.location.pathname}?${RETURN_FLAG}=1`,
                  ),
                )
              }
              className="mt-9 min-h-[3.25rem] w-full rounded-full bg-gold-deep px-6 text-[15px] font-semibold text-paper transition-colors hover:bg-ink active:scale-[0.99]"
            >
              {t('give', { amount: amountNok })}
            </button>

            <button
              type="button"
              onClick={() => close()}
              className="mt-4 min-h-11 text-[14px] text-ink-60 underline underline-offset-4 transition-colors hover:text-ink"
            >
              {t('dismiss')}
            </button>
          </>
        )}
      </div>
    </dialog>
  );
}
