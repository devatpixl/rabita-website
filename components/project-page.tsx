import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Accent } from './accent';
import { SectionBody } from './primitives';
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
          <h1 className="font-serif text-display text-balance text-paper">{title}</h1>
          <p className="mt-6 max-w-prose text-body text-paper/80">{lede}</p>
          {(primary || secondary) && (
            <div className="mt-9 flex flex-wrap items-center gap-4">
              {primary?.give && <GiveCTA label={primary.label} />}
              {primary && !primary.give && primary.href && (
                <Link
                  href={primary.href}
                  className="inline-flex min-h-12 items-center rounded-full bg-gold-deep px-6 py-3 text-[15px] font-semibold text-paper transition-colors hover:bg-gold"
                >
                  {primary.label}
                </Link>
              )}
              {secondary && (
                <Link
                  href={secondary.href}
                  className="inline-flex min-h-12 items-center rounded-full border border-paper/40 px-6 py-3 text-[15px] font-semibold text-paper transition-colors hover:border-paper"
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

// The brief: what this page is, set as one paragraph under a dateline rule.
//
// This was a boxed initial floated into a justified paragraph, and every part
// of that was working against the others:
//
//   - the "drop cap" was a rounded, bordered, filled tile, which reads as a UI
//     chip rather than typography;
//   - its h-[1.3em] resolved against its OWN text-[2.7em], so the box computed
//     to ~84px and swallowed three lines as a float;
//   - at a 52ch measure with a float that size has nowhere to put
//     the slack, so it opened rivers between words;
//   - and when the float ended, line 4 snapped back to the true left margin,
//     giving the paragraph a stepped left edge — the part that actually looked
//     broken.
//
// A standfirst does not need a drop cap. Drop caps open long-form text; this is
// four lines. What it needs is one clean left edge, a measure it can hold, and
// a label that sits ON the page rather than marooned in its own column.
export function ProjectBrief({ label, body }: { label: string; body: string }) {
  return (
    <section className="bg-paper py-section-md">
      <SectionBody>
        {/* Label on the rule, running the full measure — a dateline, not a
           column. It used to take md:col-span-3 to carry eight characters,
           which left ~250px of white between it and the sentence it labels. */}
        <div className="flex items-center gap-5">
          <p className="whitespace-nowrap font-mono text-[0.75rem] uppercase tracking-[0.16em] text-gold-deep">
            {label}
          </p>
          <span aria-hidden className="h-px flex-1 bg-rule" />
        </div>

        {/* Ragged right, not justified. Browser justification has no proper
           hyphenation dictionary for Norwegian or Arabic, so at this measure
           it can only stretch word spaces. 44ch is a measure this size of
           serif can actually hold. */}
        <p className="mt-8 max-w-[44ch] font-serif text-[clamp(1.2rem,2vw,1.65rem)] leading-[1.45] text-ink">
          {body}
        </p>
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
          <h2 className="font-serif text-section text-balance text-ink">{heading}</h2>
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
            <p className="mt-5 max-w-prose text-body text-dusk-60">{lede}</p>
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
