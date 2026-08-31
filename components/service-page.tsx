import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SectionBody } from './primitives';
import { cn } from '@/lib/cn';

// The shape every page under "Prayer and services" uses. Deliberately not the mosque project shape: that section opens on a full bleed dusk hero, this one opens light and split, so a reader can feel which part of the site they are in without reading the breadcrumb.
const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

export function ServiceHero({
  crumb,
  eyebrow,
  title,
  lede,
  image,
  alt,
  note,
}: {
  crumb: string;
  eyebrow: string;
  title: ReactNode;
  lede: string;
  image: string;
  alt: string;
  note?: string;
}) {
  return (
    <section className="bg-paper pb-10 pt-8 md:pb-section-md md:pt-section-sm">
      <SectionBody>
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-ink-60">{crumb}</p>
        <div className="mt-6 grid items-start gap-7 md:mt-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-6">
            <h1 className="font-serif text-display text-balance text-ink">{title}</h1>
            <p className="mt-5 max-w-prose text-body text-ink-60 md:mt-6">{lede}</p>
            {/* Desktop keeps the note under the words, where it closes the
               reading column. */}
            {note && (
              <p className="mt-8 hidden border-t border-rule pt-5 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-60 md:block">
                {note}
              </p>
            )}
          </div>
          <div className="md:col-span-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-paper-2">
              <Image src={image} alt={alt} fill priority sizes="(min-width: 768px) 48vw, 90vw" className="object-cover" style={{ filter: GRADE }} />
            </div>
          </div>
          {/* On a phone the columns stack, so the note printed BETWEEN the
             words and their own photograph — a ruled line marooned in the
             middle with 48px of grid gap either side, which is the empty
             space the client flagged. Below the picture it reads as what it
             is: the practical footnote that closes the block. */}
          {note && (
            <p className="border-t border-rule pt-4 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-60 md:hidden">
              {note}
            </p>
          )}
        </div>
      </SectionBody>
    </section>
  );
}

// The practical answer, as a register of rows rather than columns of prose.
export function ServiceRegister({
  eyebrow,
  heading,
  rows,
}: {
  eyebrow: string;
  heading: ReactNode;
  rows: { term: string; detail: string; note?: string; href?: string }[];
}) {
  return (
    <section className="bg-paper-2 py-section-md">
      <SectionBody>
        <div className="max-w-3xl">
          <h2 className="font-serif text-section text-balance text-ink">{heading}</h2>
        </div>
        <dl className="mt-12 border-t border-rule">
          {rows.map((r) => (
            <div key={r.term} className="grid gap-x-8 gap-y-1 border-b border-rule py-5 md:grid-cols-12 md:items-baseline">
              {/* inline-flex with min-h-11 on the link rather than a bare
                 inline one: at 23px tall these were the smallest tap targets
                 on the site, and on this page they are the only way into the
                 six service pages. */}
              <dt className="font-serif text-[1.15rem] text-ink md:col-span-3">
                {r.href ? (
                  <Link
                    href={r.href}
                    className="inline-flex min-h-11 items-center underline decoration-gold underline-offset-4 transition-colors hover:text-gold-deep"
                  >
                    {r.term}
                  </Link>
                ) : (
                  r.term
                )}
              </dt>
              <dd className="text-body text-ink-60 md:col-span-6">{r.detail}</dd>
              <dd className="font-mono text-[0.75rem] uppercase tracking-[0.14em] tabular-nums text-gold-deep md:col-span-3 md:text-end">
                {r.note ?? ''}
              </dd>
            </div>
          ))}
        </dl>
      </SectionBody>
    </section>
  );
}

// Two picture cards, which is the beat the mosque project pages do not have.
export function ServiceCards({
  eyebrow,
  heading,
  cards,
}: {
  eyebrow: string;
  heading: ReactNode;
  cards: { title: string; body: string; image: string }[];
}) {
  return (
    <section className="bg-paper py-section-md">
      <SectionBody>
        <div className="max-w-3xl">
          <h2 className="font-serif text-section text-balance text-ink">{heading}</h2>
        </div>
        <ul className="mt-12 grid gap-10 md:grid-cols-2">
          {cards.map((c) => (
            <li key={c.title}>
              <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-paper-2">
                <Image src={c.image} alt={c.title} fill loading="eager" sizes="(min-width: 768px) 46vw, 90vw" className="object-cover" style={{ filter: GRADE }} />
              </div>
              <h3 className="mt-6 font-serif text-card text-ink">{c.title}</h3>
              <p className="mt-2 max-w-prose text-body text-ink-60">{c.body}</p>
            </li>
          ))}
        </ul>
      </SectionBody>
    </section>
  );
}

// Every page in this section closes on how to actually turn up.
export function ServiceVisit({
  heading,
  address,
  postal,
  hours,
  body,
  primary,
  secondary,
}: {
  heading: ReactNode;
  address: string;
  postal: string;
  hours: string;
  body: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}) {
  return (
    <section className="bg-paper-deep py-section-md">
      <SectionBody>
        <div className="grid gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <h2 className="font-serif text-section text-balance text-ink">{heading}</h2>
            <p className="mt-5 max-w-prose text-body text-ink-60">{body}</p>
          </div>
          <div className="md:col-span-4">
            <p className="font-serif text-card text-ink">{address}</p>
            <p className="text-body text-ink-60">{postal}</p>
            <p className="mt-4 font-mono text-[0.75rem] uppercase tracking-[0.14em] tabular-nums text-ink-60">{hours}</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:col-span-3">
            <Link
              href={primary.href}
              className="inline-flex min-h-12 items-center rounded-full bg-gold-deep px-5 py-3 text-[15px] font-semibold text-paper transition-colors hover:bg-ink"
            >
              {primary.label}
            </Link>
            <Link
              href={secondary.href}
              className="inline-flex min-h-11 items-center text-[15px] font-semibold text-ink underline decoration-gold underline-offset-4"
            >
              {secondary.label}
            </Link>
          </div>
        </div>
      </SectionBody>
    </section>
  );
}
