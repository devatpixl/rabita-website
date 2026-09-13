'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { APARTMENT_UNITS, unitFace, unitPlan, type ApartmentUnit } from '@/lib/apartment-units';
import { SectionBody } from './primitives';
import { Accent } from './accent';
import { Reveal } from './reveal';

// The apartments, one card each, opening the architect's plan sheet
// (client, 2026-09-13). This stands where "sentral beliggenhet" stood: that
// section made four claims about the neighbourhood, and a buyer on this page
// has already been told where the building is twice.
//
// The card register is the gift ladder's, which the client pointed at as the
// look he wanted: a photograph going dark at the foot, a gold rule, a serif
// figure, and the words sitting on the picture. What it is NOT is the
// reference site's treatment — a green price bar clamped over every thumbnail
// — because a price band that colour on this palette reads as a supermarket
// shelf tag.
//
// The figures are never translated, only their labels: every number comes off
// the plan sheet and has to be the same number in Norwegian, English and
// Arabic. `nb-NO` grouping throughout, which is what the sheet and the price
// list use.

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-paper/10 py-2.5 last:border-0">
      <dt className="text-[0.8125rem] text-paper/60">{label}</dt>
      <dd className="text-end font-mono text-[0.8125rem] tabular-nums text-paper">{value}</dd>
    </div>
  );
}

export function ApartmentUnits() {
  const t = useTranslations('apartmentsPage.units');
  const [open, setOpen] = useState<ApartmentUnit | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const nf = new Intl.NumberFormat('nb-NO');
  const num = (n: number) => nf.format(n);
  // Ceiling heights keep both decimals — the plan sheet says "ca 2,40 m", and
  // plain formatting drops the trailing zero to "2,4", which reads as a
  // different, less precise measurement than the architect gave.
  const nf2 = new Intl.NumberFormat('nb-NO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const metres = (n: number) => nf2.format(n);

  // Escape closes; the scroll lock goes on the documentElement, because
  // globals.css sets overflow-x: clip on html and that makes html the
  // scrolling element — locking body alone does nothing (learned the hard way
  // on the room-photo dialog, 2026-09-13).
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <section className="relative overflow-hidden bg-dusk py-section-md text-paper">
      {/* The same warm bloom the section it replaces carried, so the dark
         ground has a light in it rather than reading as a flat block. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -start-24 top-1/3 h-[32rem] w-[32rem] rounded-full bg-gold/[0.07] blur-3xl"
      />
      <SectionBody className="relative">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
          {t('eyebrow')}
        </p>
        <h2 className="mt-4 max-w-2xl font-serif text-section text-balance text-paper">
          {t.rich('heading', { em: (chunks) => <Accent surface="dusk">{chunks}</Accent> })}
        </h2>
        <p className="mt-4 max-w-[52ch] text-body text-paper/70">{t('lede')}</p>

        <ol className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-3 lg:gap-6">
          {APARTMENT_UNITS.map((u, i) => (
            <Reveal as="li" key={u.id} delay={(i % 3) * 0.08}>
              <button
                type="button"
                onClick={() => setOpen(u)}
                aria-label={`${t(`items.${u.id}.title`)} — ${t('openLabel')}`}
                className="group/unit relative flex w-full flex-col justify-end overflow-hidden rounded-2xl bg-ink text-start ring-1 ring-inset ring-paper/10 transition-[box-shadow] duration-300 ease-out hover:ring-gold/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold aspect-[4/5]"
              >
                <span aria-hidden className="absolute inset-0">
                  <Image
                    src={unitFace(u.id)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw"
                    className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/unit:scale-[1.04]"
                  />
                </span>
                {/* Two stacked scrims rather than one that changes: a
                   background-image cannot transition its own stops. */}
                <span
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(22,36,46,0) 30%, rgba(22,36,46,0.55) 58%, rgba(22,36,46,0.93) 86%, rgba(22,36,46,0.97) 100%)',
                  }}
                />
                <span
                  aria-hidden
                  className="absolute inset-0 opacity-0 transition-opacity duration-[420ms] ease-out group-hover/unit:opacity-100 group-focus-visible/unit:opacity-100"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(22,36,46,0.1) 20%, rgba(22,36,46,0.68) 55%, rgba(22,36,46,0.97) 88%, rgba(22,36,46,0.99) 100%)',
                  }}
                />

                <span className="relative z-10 p-5 sm:p-6">
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.18em] tabular-nums text-gold-soft">
                      {u.unit}
                    </span>
                    <span
                      aria-hidden
                      className="h-px w-8 bg-gold-soft/55 transition-[width] duration-[320ms] ease-out group-hover/unit:w-14 group-focus-visible/unit:w-14"
                    />
                  </span>
                  <span className="mt-3 block font-serif text-[clamp(1.5rem,2.4vw,1.9rem)] leading-none text-paper">
                    {num(u.priceNok)}{' '}
                    <span className="font-sans text-[0.8em] text-paper/70">kr</span>
                  </span>
                  <span className="mt-2.5 block font-serif text-[1.05rem] leading-snug text-paper">
                    {t(`items.${u.id}.title`)}
                  </span>
                  <span className="mt-2 block font-mono text-[0.6875rem] tabular-nums tracking-[0.1em] text-paper/60">
                    {t('sqm', { n: num(u.braM2) })} · {t('labels.floor')} {u.floor}
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </ol>
      </SectionBody>

      {/* ── the plan sheet ─────────────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t(`items.${open.id}.title`)}
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto overscroll-contain bg-dusk/70 p-4 backdrop-blur-[3px] sm:p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(null);
          }}
        >
          <div className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-dusk ring-1 ring-inset ring-paper/12">
            <div className="flex items-center justify-between gap-4 border-b border-paper/10 px-5 py-3.5 sm:px-7">
              <p className="font-serif text-[1.05rem] text-paper">
                {t(`items.${open.id}.title`)}
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(null)}
                aria-label={t('closeLabel')}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 ring-inset ring-paper/25 text-paper transition-colors hover:bg-paper hover:text-dusk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <span aria-hidden className="text-[1.1rem] leading-none">&times;</span>
              </button>
            </div>

            {/* The sheet itself. object-contain, never cover: a floor plan
               that is cropped is a floor plan that lies. */}
            <div className="relative aspect-[1024/724] w-full bg-paper-2">
              <Image
                src={unitPlan(open.id)}
                alt={t('planAlt', { unit: open.unit })}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-contain"
              />
            </div>

            <div className="px-5 py-6 sm:px-7 sm:py-7">
              <p className="max-w-[60ch] text-body text-paper/75">
                {t(`items.${open.id}.lede`)}
              </p>
              <p className="mt-5 font-serif text-[1.6rem] leading-none text-paper">
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
                  {t('price')}
                </span>
                <span className="mt-2 block">
                  {num(open.priceNok)} <span className="font-sans text-[0.7em] text-paper/70">kr</span>
                </span>
              </p>

              <p className="mt-7 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-soft">
                {t('keyInfo')}
              </p>
              <dl className="mt-2">
                <Row label={t('labels.floor')} value={String(open.floor)} />
                <Row label={t('labels.bra')} value={t('sqm', { n: num(open.braM2) })} />
                <Row label={t('labels.prom')} value={t('sqm', { n: num(open.pRomM2) })} />
                <Row label={t('labels.balcony')} value={t('sqm', { n: num(open.balconyM2) })} />
                <Row
                  label={t('labels.ceilingGeneral')}
                  value={t('approx', { m: metres(open.ceilingGeneralM) })}
                />
                <Row
                  label={t('labels.ceilingBath')}
                  value={t('approx', { m: metres(open.ceilingBathM) })}
                />
                <Row
                  label={t('labels.ceilingHall')}
                  value={t('approx', { m: metres(open.ceilingHallM) })}
                />
              </dl>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
