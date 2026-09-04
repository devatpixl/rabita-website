'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

// "Dette er Rabita" — the typographic threshold between the hero's pitch
// and the introduction of the organisation (client, 2026-09-04, pointing at
// innocents.no's INNOCENTS/NORGE section: "copy the scroll part as it is").
//
// Ported from Innocents-New-Website components/sections/BrandType.tsx and
// its globals.css block, with Rabita's palette, type and photo. The
// mechanism is theirs, wholesale:
//
//   - the outer section is a tall scroll runway; a 100svh stage pins
//     inside it;
//   - a rAF loop writes scroll progress to the CSS variable --p, and CSS
//     derives everything from it — no per-frame React;
//   - an SVG mask paints a paper rect with the words knocked out, over the
//     photograph, and scales the letterforms 1x → ~61x so the scroll dives
//     through the counters of the type into the picture;
//   - past --p 0.55 the full photograph fades in over the top and the
//     section hands over.
//
// On phones (≤700px) the sticky runway is dropped ENTIRELY in CSS and a
// single editorial card renders instead — Innocents shipped that after
// real users read the near-empty paper viewport as a blank screen, and
// mobile Safari abandons SVG masks at extreme scales. Their fix, kept.

export function BrandType() {
  const t = useTranslations('brandType');
  const wrapRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 700px)').matches;
    if (reduced || isMobile) {
      stage.style.setProperty('--p', '0');
      return;
    }

    let raf = 0;
    let last = -1;
    const tick = () => {
      const rect = wrap.getBoundingClientRect();
      // The stage's own height rather than window.innerHeight: the mobile
      // URL bar collapsing would make innerHeight jitter the progress.
      const stageH = stage.offsetHeight;
      const total = rect.height - stageH;
      const scrolled = -rect.top;
      const active = total * 0.82;
      const p = active > 0 ? Math.max(0, Math.min(1, scrolled / active)) : 0;
      if (Math.abs(p - last) > 0.0005) {
        stage.style.setProperty('--p', p.toFixed(4));
        last = p;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section ref={wrapRef} className="brand-type-section" aria-label={t('label')}>
      <h2 className="brand-type-sr">{t('sr')}</h2>
      <div ref={stageRef} className="brand-type-stage">
        <div className="brand-type-stage__photo" aria-hidden="true" />
        <div className="brand-type-stage__vignette" aria-hidden="true" />
        <svg
          className="brand-type-stage__svg"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <mask id="brand-type-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900">
              <rect width="1600" height="900" fill="white" />
              <g className="brand-type-stage__textwrap">
                <text className="brand-type-stage__text" textAnchor="middle" fill="black">
                  <tspan x="800" y="430">{t('line1')}</tspan>
                  <tspan x="800" dy="220" className="brand-type-stage__text--wide">
                    {t('line2')}
                  </tspan>
                </text>
              </g>
            </mask>
          </defs>
          <rect className="brand-type-stage__paper" width="1600" height="900" mask="url(#brand-type-mask)" />
        </svg>
        <div className="brand-type-stage__final" aria-hidden="true" />
        <span className="brand-type-stage__eyebrow" aria-hidden="true">
          {t('eyebrow')}
        </span>
        <span className="brand-type-stage__sig" aria-hidden="true">
          &mdash; <em>{t('sig')}</em>
        </span>
      </div>
    </section>
  );
}
