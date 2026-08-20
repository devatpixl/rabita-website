import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Accent } from './accent';
import { Eyebrow, SectionBody } from './primitives';
import { GiveCTA } from './give-cta';

// The shared shape every page under "The mosque project" uses: a full bleed hero, a brief, a set of numbered columns, then the assurances. One structure, different content, so the section reads as one place.
const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

export function ProjectHero({
  crumb,
  eyebrow,
  title,
  lede,
  image,
  alt,
  primary,
  secondary,
}: {
  crumb: string;
  eyebrow: string;
  title: ReactNode;
  lede: string;
  image: string;
  alt: string;
  primary?: { label: string; href?: string; give?: boolean };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="relative isolate -mt-[77px] overflow-hidden bg-dusk pt-[77px] text-paper">
      <div className="absolute inset-0">
        <Image src={image} alt={alt} fill priority sizes="100vw" className="object-cover" style={{ filter: GRADE }} />
        <div aria-hidden className="absolute inset-0 bg-dusk/80" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-dusk via-dusk/70 to-transparent" />
      </div>

      <SectionBody className="relative py-section-md">
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-dusk-60">{crumb}</p>
        <div className="mt-8 max-w-3xl">
          <Eyebrow tone="gold">{eyebrow}</Eyebrow>
          <h1 className="mt-4 font-serif text-display text-balance text-paper">{title}</h1>
          <p className="mt-6 max-w-prose hyphens-auto text-justify text-body text-paper/80">{lede}</p>
          {(primary || secondary) && (
            <div className="mt-9 flex flex-wrap items-center gap-4">
              {primary?.give && <GiveCTA label={primary.label} />}
              {primary && !primary.give && primary.href && (
                <Link
                  href={primary.href}
                  className="inline-flex min-h-12 items-center rounded-btn bg-gold-deep px-6 py-3 text-[15px] font-semibold text-paper transition-colors hover:bg-gold"
                >
                  {primary.label}
                </Link>
              )}
              {secondary && (
                <Link
                  href={secondary.href}
                  className="inline-flex min-h-12 items-center rounded-btn border border-paper/40 px-6 py-3 text-[15px] font-semibold text-paper transition-colors hover:border-paper"
                >
                  {secondary.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </SectionBody>
    </section>
  );
}

// The brief: what this page is, set as one paragraph against a label, so a reader gets the whole answer before any detail.
export function ProjectBrief({ label, body }: { label: string; body: string }) {
  // Arabic has no capital forms, so the tile is only worth setting on the latin scripts
  const initial = body.slice(0, 1);
  const rest = body.slice(1);
  const stamped = /^[A-Za-zÀ-ɏ]$/.test(initial);

  return (
    <section className="bg-paper py-section-md">
      <SectionBody>
        <div className="grid gap-8 md:grid-cols-12">
          {/* Rule down the side of the label rather than under it, the way innocents sets its datelines */}
          <div className="md:col-span-3">
            <div className="border-s border-gold-deep ps-4">
              <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-gold-deep">{label}</p>
            </div>
          </div>
          <p className="md:col-span-9 max-w-[52ch] hyphens-auto text-justify font-serif text-[clamp(1.15rem,1.9vw,1.5rem)] leading-[1.5] text-ink">
            {stamped ? (
              <>
                <span
                  className="float-start me-4 mt-[0.1em] flex h-[1.3em] w-[1.3em] items-center justify-center rounded-2xl border border-gold/40 bg-paper-2 text-[2.7em] leading-none text-gold-deep"
                >
                  {initial}
                </span>
                {rest}
              </>
            ) : (
              body
            )}
          </p>
        </div>
      </SectionBody>
    </section>
  );
}

// The detail, as a numbered register rather than prose.
export function ProjectColumns({
  eyebrow,
  heading,
  items,
}: {
  eyebrow: string;
  heading: ReactNode;
  items: { title: string; body: string }[];
}) {
  return (
    <section className="bg-paper-2 py-section-md">
      <SectionBody>
        <div className="max-w-3xl">
          <Eyebrow tone="gold-deep">{eyebrow}</Eyebrow>
          <h2 className="mt-4 font-serif text-section text-balance text-ink">{heading}</h2>
        </div>
        <ul className="mt-14 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <li key={it.title} className="border-t border-rule pt-5">
              <span className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-gold-deep">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-serif text-[1.15rem] leading-tight text-ink">{it.title}</h3>
              <p className="mt-2 max-w-[40ch] text-[14px] leading-relaxed text-ink-60">{it.body}</p>
            </li>
          ))}
        </ul>
      </SectionBody>
    </section>
  );
}

// The closing band, identical on every page in this section: what a giver can hold the organisation to.
export function ProjectAssurance({
  heading,
  lede,
  items,
}: {
  heading: ReactNode;
  lede: string;
  items: { title: string; body: string }[];
}) {
  return (
    <section className="bg-dusk py-section-md text-paper">
      <SectionBody>
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <h2 className="font-serif text-section text-balance text-paper">{heading}</h2>
            <p className="mt-5 max-w-prose hyphens-auto text-justify text-body text-dusk-60">{lede}</p>
          </div>
          <ul className="md:col-span-8">
            {items.map((it, i) => (
              <li key={it.title} className="grid gap-x-8 gap-y-2 border-t border-paper/15 py-6 md:grid-cols-12">
                <span className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-gold md:col-span-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-serif text-[1.15rem] text-paper md:col-span-4">{it.title}</h3>
                <p className="max-w-[46ch] text-[14px] leading-relaxed text-dusk-60 md:col-span-7">{it.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </SectionBody>
    </section>
  );
}

export function ProjectPage({ children }: { children: ReactNode }) {
  return <main>{children}</main>;
}
