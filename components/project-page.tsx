import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Accent } from './accent';
import { AssuranceList, type AssuranceItem } from './assurance-list';
import { SectionBody } from './primitives';
import { GiveCTA } from './give-cta';

// The shared shape every page under "The mosque project" uses: a full bleed hero, a brief, a set of numbered columns, then the assurances. One structure, different content, so the section reads as one place.
const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

export function ProjectHero({
  crumb,
  eyebrow,
  title,
  lede,
  ledeShort,
  aside,
  image,
  alt,
  primary,
  secondary,
}: {
  crumb: string;
  eyebrow: string;
  title: ReactNode;
  lede: string;
  /** One or two lines for phones; the full lede shows from md. */
  ledeShort?: string;
  image: string;
  alt: string;
  primary?: { label: string; href?: string; give?: boolean };
  secondary?: { label: string; href: string };
  /** Optional right-hand column, e.g. a giving box. */
  aside?: ReactNode;
}) {
  // The negative margin pulls the hero under the sticky header so the picture
  // starts at the top of the screen. It has to match the header's real height,
  // which is 60px on a phone since 2026-08-30 and 77 from md up.
  return (
    <section className="relative isolate -mt-[60px] overflow-hidden bg-dusk pt-[60px] text-paper md:-mt-[77px] md:pt-[77px]">
      {/* Below md the picture is CAPPED at 52svh rather than covering the
         section. With a giving card in the hero this section runs ~1080px on
         a phone, and stretching a 16:9-ish render over that with object-cover
         showed about a fifth of the frame — the photo read as massively
         zoomed in. Capped, the render keeps its proportions and plain dusk
         carries the rest of the section behind the card. 52svh, not more:
         the source is a wide band, so a taller box magnifies it again. */}
      <div className="absolute inset-x-0 top-0 h-[52svh] md:inset-0 md:h-auto">
        <Image src={image} alt={alt} fill priority sizes="100vw" className="object-cover" style={{ filter: GRADE }} />
        {/* A light veil plus a reading-side gradient. The flat 80% dusk
           that used to sit here turned every render into a dark slab; now
           the picture shows on the right and the words stay legible on
           the left. */}
        <div aria-hidden className="absolute inset-0 bg-dusk/30" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-dusk via-dusk/65 to-transparent" />
        {/* Foot fade, phones only: the capped crop has a hard bottom edge
           otherwise, right where the dusk section continues. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-dusk md:hidden"
        />
      </div>

      {/* With a card in the hero the whole thing has to fit a 13-inch laptop
         screen: 8 units of padding, not the section default. */}
      <SectionBody className={aside ? 'relative py-10 md:py-14' : 'relative py-section-md'}>
        {!aside && (
          <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-dusk-60">{crumb}</p>
        )}
        <div className={aside ? 'grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12' : undefined}>
        <div className={aside ? 'max-w-3xl lg:col-span-6' : 'mt-8 max-w-3xl'}>
          {aside && (
            <p className="mb-5 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-dusk-60">{crumb}</p>
          )}
          <h1 className="font-serif text-display text-balance text-paper">{title}</h1>
          {ledeShort ? (
            <>
              <p className="mt-5 max-w-prose text-body text-paper/80 md:hidden">{ledeShort}</p>
              <p className="mt-6 hidden max-w-prose text-body text-paper/80 md:block">{lede}</p>
            </>
          ) : (
            <p className="mt-6 max-w-prose text-body text-paper/80">{lede}</p>
          )}
          {(primary || secondary) && (
            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
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
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-paper/40 px-6 py-3 text-[15px] font-semibold text-paper transition-colors hover:border-paper"
                >
                  {secondary.label}
                </Link>
              )}
            </div>
          )}
        </div>
        {aside && (
          <div
            className="no-scrollbar lg:col-span-6 lg:max-h-[var(--project-card-cap)] lg:w-full lg:justify-self-end lg:self-center lg:overflow-y-auto lg:max-w-[27.5rem]"
            style={{ ['--project-card-cap' as string]: 'calc(100svh - 122px - clamp(12px, 100svh - 700px, 48px))' }}
          >
            {aside}
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
  items: AssuranceItem[];
}) {
  return (
    <section className="bg-dusk py-section-md text-paper">
      <SectionBody>
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          {/* Sticky, so the heading keeps company with the list instead of
             stranding above an empty column. */}
          <div className="md:col-span-4 md:sticky md:top-28 md:self-start">
            <h2 className="font-serif text-section text-balance text-paper">{heading}</h2>
            <p className="mt-5 max-w-prose text-body text-paper/70">{lede}</p>
          </div>
          <div className="md:col-span-8">
            <AssuranceList items={items} />
          </div>
        </div>
      </SectionBody>
    </section>
  );
}

export function ProjectPage({ children }: { children: ReactNode }) {
  return <main>{children}</main>;
}
