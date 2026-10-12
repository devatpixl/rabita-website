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
// library photos, minus five the user rejected on 2026-10-11 (laptop 4, 6,
// 7, 8, 9: congregation close-up, two faces, prayer-hall interior, minaret
// render, facade render — and the same positions on the phone list); then on
// 2026-10-12 phone-only cuts of 4, 6, 10 and 14 (women's circle, the
// un-mirrored imam, a crowd, the hall from the stands). The lists are now
// separate selections of different lengths; index 0 is the current photo. 

type Candidate = { src: string; pos: string; scale?: number };

export const MOBILE_CANDIDATES: Candidate[] = [
  { src: '/hero/eid-congregation-4x5.jpg', pos: '32% 42%' },
  { src: '/hero/cand/c03.webp', pos: '50% 50%' }, // rows in sujud, Vallhall
  { src: '/hero/cand/c04.webp', pos: '45% 50%' }, // crowd, hands raised
  // ── the user's nine, 2026-10-11 (public/hero/cand/) ──────────────────
  // All nine are landscape, so a phone's 4:5 frame keeps only a ~35% slice of
  // the width: the x value is the whole crop. Set from the contact sheet.
  { src: '/hero/cand/c06.webp', pos: '50% 50%' }, // hall, rows standing
  { src: '/photos/story-khutbah.webp', pos: '70% 25%' }, // imam at the minbar
  { src: '/photos/community/mother-child.webp', pos: '50% 30%' },
  { src: '/hero/volunteers-gateiftar-4x5.jpg', pos: '50% 40%' },
  { src: '/hero/cand/c01.webp', pos: '0% 30%' }, // imam from behind, LEFT edge; hall right (file mirrored 2026-10-11, user: "imam looks on left")
  { src: '/hero/cand/c02.webp', pos: '14% 45%' }, // imam at the lectern, far left
  { src: '/hero/cand/c07.webp', pos: '45% 50%' }, // hall, front row + volunteers
  // ── added 2026-10-12 (user: "add m2 and m3"), portrait sources, crops
  // tuned so the subject stands in the clear top half above the headline ──
  { src: '/hero/cand/c08.webp', pos: '50% 70%' }, // Sørligata door, umbrellas; people at the foot
  { src: '/photos/svc-shahada-adhan-phone.webp', pos: '35% 30%' }, // the adhan, crescent behind
];

export const DESKTOP_CANDIDATES: Candidate[] = [
  { src: '/hero/eid-congregation-16x9.jpg', pos: '32% 42%', scale: 1.45 },
  { src: '/hero/volunteers-gateiftar-16x9.jpg', pos: '50% 40%' },
  { src: '/photos/brand-eid-2x.webp', pos: '50% 55%' },
  { src: '/photos/hero-iftar.webp', pos: '50% 45%' },
  // ── the user's nine, 2026-10-11 ───────────────────────────────────────
  // 3:2 sources in a ~2:1 frame crop only top/bottom, so only y matters here.
  { src: '/hero/cand/c01.webp', pos: '0% 30%' }, // mirrored; the imam is the left 40% of the frame
  { src: '/hero/cand/c01-orig.webp', pos: '100% 30%' }, // un-mirrored, imam right
  { src: '/hero/cand/c02.webp', pos: '50% 45%' },
  { src: '/hero/cand/c03.webp', pos: '50% 50%' },
  { src: '/hero/cand/c04.webp', pos: '50% 45%' },
  { src: '/hero/cand/c05.webp', pos: '50% 45%' },
  { src: '/hero/cand/c06.webp', pos: '50% 50%' },
  { src: '/hero/cand/c07.webp', pos: '50% 45%' },
  { src: '/hero/cand/c08.webp', pos: '50% 60%' },
  { src: '/hero/cand/c09.webp', pos: '50% 55%' },
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
  // The two lists are separate selections since 2026-10-12 (the user trimmed
  // the phone list only), so they are different lengths. The arrows wrap on
  // whichever list this screen is showing — md is 768px, Tailwind's default
  // — and ?foto=N means "photo N on this device".
  const go = (delta: number) =>
    setI((cur) => {
      const wide = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
      const len = wide ? DESKTOP_CANDIDATES.length : MOBILE_CANDIDATES.length;
      const next = (((cur % len) + delta) % len + len) % len;
      writeParam(next);
      return next;
    });

  const btn =
    'grid h-8 w-8 place-items-center rounded-full text-paper text-[1.25rem] leading-none transition-colors hover:bg-paper/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold md:h-10 md:w-10 md:text-[1.6rem]';

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
         content layer (z-10) so the corner is clickable. TOP-RIGHT of the
         photo at every width — it was bottom-right from md, which on a
         laptop whose window is shorter than the hero sat below the fold,
         next to the chat bubble (user, 2026-10-11: "can't swap? where
         arrows"). From md it sits top-LEFT: the giving card rises to within
         40px of the header on 1280×720 / 1366×768 windows and a top-right
         control would overlap it; the headline on the left starts 100px+
         lower at every size. Larger from md so it reads at a glance. */}
      <div
        className="pointer-events-auto absolute end-4 top-4 z-20 flex items-center gap-0.5 rounded-full bg-dusk/70 p-1 text-paper ring-1 ring-paper/20 backdrop-blur-sm md:end-auto md:start-8 md:top-4 md:gap-1 md:p-1.5"
        role="group"
        aria-label="Bytt foto"
      >
        <button type="button" className={btn} onClick={() => go(-1)} aria-label="Forrige foto">
          <span aria-hidden className="rtl:rotate-180">&lsaquo;</span>
        </button>
        <span className="min-w-[4.5ch] text-center font-mono text-[0.6875rem] tabular-nums tracking-[0.12em] md:min-w-[5.5ch] md:text-[0.8125rem]">
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
