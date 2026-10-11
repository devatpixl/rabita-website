'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// ── TEMPORARY: A PHOTO PICKER ON THE FRONT-PAGE HERO ─────────────────────
// User, 2026-10-11: "for now testing, I use small arrows to switch between
// photos on hero page … so client can choose the final photo … only images
// swappable, nothing else, components same".
//
// This swaps ONLY the two background photographs (one portrait for phones,
// one landscape from md) and adds a small ‹ 3 / 8 › control in a corner.
// Headline, lede, buttons, counter and the giving card are untouched; the
// scrims in hero.tsx stay exactly where they were. The choice is mirrored
// into the address (?foto=3) so the client can send us a link to the one he
// wants. Nothing is stored.
//
// TO REMOVE once a photo is chosen: set HERO_PICKER = false in hero.tsx, put
// the chosen file into HERO_IMAGE there (and its objectPosition into
// HERO_ART), and delete this file.
//
// Candidate order is the shortlist from the 2026-10-10 review of all 245
// library photos; index 0 is the current photo on each list. BOTH LISTS ARE
// THE SAME LENGTH on purpose: one index drives both, and the number in
// ?foto= must match the counter on every screen.

type Candidate = { src: string; pos: string; scale?: number };

export const MOBILE_CANDIDATES: Candidate[] = [
  { src: '/hero/eid-congregation-4x5.jpg', pos: '32% 42%' },
  { src: '/photos/community/mother-child.webp', pos: '50% 30%' },
  { src: '/hero/volunteers-gateiftar-4x5.jpg', pos: '50% 40%' },
  { src: '/photos/story-khutbah.webp', pos: '50% 40%' },
  { src: '/photos/community/womens-circle.webp', pos: '50% 35%' },
  { src: '/photos/svc-ungdom-leir.webp', pos: '50% 45%' },
  { src: '/photos/brand-eid-2x.webp', pos: '50% 60%' },
  { src: '/photos/zoom-minaret.webp', pos: '50% 55%' },
  { src: '/photos/subj-skole-klassebilde.webp', pos: '50% 40%' },
];

export const DESKTOP_CANDIDATES: Candidate[] = [
  { src: '/hero/eid-congregation-16x9.jpg', pos: '32% 42%', scale: 1.45 },
  { src: '/hero/volunteers-gateiftar-16x9.jpg', pos: '50% 40%' },
  { src: '/photos/brand-eid-2x.webp', pos: '50% 55%' },
  { src: '/photos/news-eid-congregation.webp', pos: '50% 45%' },
  { src: '/photos/hero-iftar.webp', pos: '50% 45%' },
  { src: '/photos/visit-eid.webp', pos: '50% 40%' },
  { src: '/photos/prayer-congregation.webp', pos: '50% 50%' },
  { src: '/photos/zoom-minaret.webp', pos: '50% 50%' },
  { src: '/photos/story-facade-night.webp', pos: '50% 50%' },
];

function readParam(): number {
  if (typeof window === 'undefined') return 0;
  const n = parseInt(new URLSearchParams(window.location.search).get('foto') ?? '', 10);
  return Number.isFinite(n) && n >= 1 ? n - 1 : 0;
}

function writeParam(i: number) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (i === 0) url.searchParams.delete('foto'); else url.searchParams.set('foto', String(i + 1));
  window.history.replaceState(null, '', url.toString());
}

export function HeroPhotoPicker({ filter, scaleMobile }: { filter: string; scaleMobile: number }) {
  // One index drives both lists; each list wraps on its own length, so the
  // same arrow press moves both. The client reads whichever he is on.
  const [i, setI] = useState(0);
  useEffect(() => { setI(readParam()); }, []);

  const m = MOBILE_CANDIDATES[i % MOBILE_CANDIDATES.length];
  const d = DESKTOP_CANDIDATES[i % DESKTOP_CANDIDATES.length];
  const max = Math.max(MOBILE_CANDIDATES.length, DESKTOP_CANDIDATES.length);
  const go = (delta: number) => setI((cur) => { const next = (cur + delta + max) % max; writeParam(next); return next; });

  const btn =
    'grid h-8 w-8 place-items-center rounded-full text-paper transition-colors hover:bg-paper/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold';

  return (
    <>
      <Image
        key={`m-${m.src}`}
        src={m.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="md:hidden"
        style={{
          objectFit: 'cover',
          objectPosition: m.pos,
          transform: `scale(${m.scale ?? scaleMobile})`,
          transformOrigin: m.pos,
          filter,
        }}
      />
      <Image
        key={`d-${d.src}`}
        src={d.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="hidden md:block"
        style={{
          objectFit: 'cover',
          objectPosition: d.pos,
          transform: `scale(${d.scale ?? 1})`,
          transformOrigin: d.pos,
          filter,
        }}
      />
      {/* The control. pointer-events-auto because the wrapper around the
         photographs is pointer-events-none; z-20 to sit above the hero's
         content layer (z-10) so the corner is clickable. Top-right on
         phones (the photo's own corner), bottom-right from md. */}
      <div
        className="pointer-events-auto absolute end-4 top-4 z-20 flex items-center gap-0.5 rounded-full bg-dusk/70 p-1 text-paper ring-1 ring-paper/20 backdrop-blur-sm md:top-auto md:bottom-5 md:end-6"
        role="group"
        aria-label="Bytt foto"
      >
        <button type="button" className={btn} onClick={() => go(-1)} aria-label="Forrige foto">
          <span aria-hidden className="rtl:rotate-180">&lsaquo;</span>
        </button>
        <span className="min-w-[4.5ch] text-center font-mono text-[0.6875rem] tabular-nums tracking-[0.12em]">
          <span className="md:hidden">{(i % MOBILE_CANDIDATES.length) + 1} / {MOBILE_CANDIDATES.length}</span>
          <span className="hidden md:inline">{(i % DESKTOP_CANDIDATES.length) + 1} / {DESKTOP_CANDIDATES.length}</span>
        </span>
        <button type="button" className={btn} onClick={() => go(1)} aria-label="Neste foto">
          <span aria-hidden className="rtl:rotate-180">&rsaquo;</span>
        </button>
      </div>
    </>
  );
}
