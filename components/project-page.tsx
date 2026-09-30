import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Accent } from './accent';
import { AssuranceList, type AssuranceItem } from './assurance-list';
import { SectionBody } from './primitives';
import { cn } from '@/lib/cn';
import { PlateFoot } from '@/components/plate-foot';
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
      {/* 40svh, down from 52 (2026-09-29). The render plus the h1 plus the
         lede plus a CTA row plus the giving card ran the phone hero to about
         1080px — a screen and a third before the page had said anything. The
         base value never reaches md, where inset-0 takes over, so this is a
         phone-only number. */}
      {/* ── THE SCRIM IS HORIZONTAL FROM md AND VERTICAL BELOW IT ────────
         (2026-09-30) The client on the phone view: "the mosque in bg cant be
         seen ... its very bad". He was describing three overlays stacked on
         one 338px box, all of them written for the desktop composition.

         From md the words sit in a 3fr column on the left and the render
         shows in the 2fr column on the right, so a LEFT-TO-RIGHT ramp is
         exactly right: dark where the type is, clear where the building is.

         A phone has no right column. The words span the full 342px, so that
         same ramp put its solid end over the whole frame — 65% to 100% dusk
         across everything — and then a 160px foot fade took the bottom half
         to solid, and a flat 30% veil sat over all of it. Multiply those and
         a brightness(0.9) grade and the render was a dark texture. Nothing of
         Calmeyers gate 8 survived on the page that is about Calmeyers gate 8.

         Below md the ramp is therefore VERTICAL and the picture is given the
         top of the frame to itself: clear through the sky and the upper
         lattice, ramping to solid dusk over the lower half where the words
         are. The words move down to meet it rather than starting under the
         header. Same photograph, same box, same grade — the building is
         simply no longer being erased by a gradient meant for a layout the
         phone does not have. */}
      {/* ── 42svh, AND THE NUMBER IS ABOUT WIDTH, NOT HEIGHT ─────────────
         The render is 1.81:1 and a phone box is about 1:1, so object-cover
         matches the box's HEIGHT and throws away the width. A taller box is
         therefore a more zoomed one: at 52svh the frame showed 49% of the
         render and read as abstract lattice; at 42 it shows 61% and the
         entrance and the street come back into it. Shorter again (34svh,
         75%) starts squeezing the picture into a strip and pushes the
         headline to the top of the frame. 42 is where the building is most
         legible. Measured, all three, at 390. */}
      <div className="absolute inset-x-0 top-0 h-[42svh] md:inset-0 md:h-auto">
        <Image src={image} alt={alt} fill priority sizes="100vw" className="object-cover" style={{ filter: GRADE }} />
        {/* The veil drops to 12% on phones. At 30 it was costing the render
           a third of its contrast before either gradient had touched it. */}
        {/* No veil at all on phones now. The words no longer sit on the
           picture — they sit on the solid foot of the ramp below it — so
           nothing here has to be darkened for type to survive on it, and a
           veil was only costing the render contrast. */}
        <div aria-hidden className="absolute inset-0 bg-dusk/30 max-md:bg-transparent" />
        {/* md+ only. `max-md:bg-none` rather than a hidden/block pair because
           this element carries nothing else — and lib/cn.ts is plain clsx, so
           the two backgrounds would otherwise both ship and the later one in
           the sheet would win by accident rather than by intent. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-dusk via-dusk/65 to-transparent max-md:bg-none"
        />
        {/* Phones: clear at the top, solid at the foot, so it hands over to
           the dusk section below with no seam. This replaces BOTH the old
           horizontal ramp and the 160px foot fade — one gradient doing one
           job, instead of two fighting over the same pixels. It is vertical,
           so there is no rtl: twin to keep in step. */}
        {/* Stops, not a plain three-colour ramp. The picture is clear for
           its first third and only then begins to go, so the building is
           genuinely visible rather than merely present under a wash, and it
           is solid dusk well before the box ends so the words below sit on
           flat colour with no gradient showing through them. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-transparent from-32% via-dusk/55 via-64% to-dusk to-94% md:hidden"
        />
      </div>

      {/* WITH A CARD, this hero runs the homepage's rules, not its own.
         Same measure (92rem against SectionBody's 84rem), same grid
         (3fr / 2fr with a gap-20), same cap on the card (640px). Both heroes
         are the one full-bleed block on their page carrying the same object,
         and every time these were two sets of numbers the card came out a
         different width or in a different place on the same screen. One set
         of rules, one result, at every viewport — nothing left to tune.

         The cost is the homepage's own, and deliberate there too: a wider
         measure moves the text column left, so the headline no longer starts
         under the wordmark. hero.tsx documents that trade.

         Without a card nothing changes — SectionBody and the section rhythm,
         as before. */}
      {(() => {
        const Body = aside
          ? ({ children }: { children: ReactNode }) => (
              // max-md:pt-[9.5rem]: the words start 120px down on a phone so
              // the top of the render is theirs alone. Without it the eyebrow
              // sits 40px under the header, on the clearest part of the
              // picture, and the only way to keep it legible is the scrim
              // that was hiding the building.
              <div className="relative z-10 mx-auto w-full max-w-[92rem] px-6 py-10 max-md:pb-0 max-md:pt-[9.5rem] md:px-10 md:py-14 lg:px-12">
                {children}
              </div>
            )
          : ({ children }: { children: ReactNode }) => (
              // The same step-down as the card variant above. Only
              // /moskeprosjektet passes an aside, so without this the other
              // four heroes would keep the new vertical scrim while starting
              // their words at the top of it — on the clearest part of the
              // picture, which is the one place the old horizontal ramp had
              // been covering for them.
              <SectionBody className="relative py-section-md max-md:pt-[9.5rem]">{children}</SectionBody>
            );
        return (
      <Body>
        {!aside && (
          <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-dusk-60 max-md:text-paper/70">{crumb}</p>
        )}
        <div className={aside ? 'grid items-center gap-10 max-md:gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-20' : undefined}>
        <div
          className={cn(
            aside ? 'max-w-3xl' : 'mt-8 max-w-3xl',
            // Clearance for the curve. It is 48px tall and is pulled up out
            // of the light block below, so it reaches back into whatever sits
            // above it — and the grid's own gap on phones is only 24. The
            // removed chevron used to be the thing occupying that space, so
            // taking it out put the foot of the lede under the sweep.
            aside && 'max-md:pb-10',
          )}
        >
          {aside && (
            <p className="mb-5 flex items-center gap-3 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-dusk-60 max-md:text-paper/70">
              {/* A short gold rule leading the line, phones only. It gives the
                 eyebrow a left edge to start from on a plate that has no other
                 structure, and it is the same gesture the dateline rules use
                 elsewhere on this page. */}
              <span aria-hidden className="h-px w-7 shrink-0 bg-gold md:hidden" />
              {crumb}
            </p>
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
            <div
              className={cn(
                'mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4',
                // With an aside, the card IS the ask and it sits about 40px
                // below this row — so on a phone, where the two stack, "Gi til
                // bygget" opens a sheet containing the card the reader can
                // already see. ~90px for a second door into the same room.
                // From md they are side by side and the button is the label
                // for the column beside it, so it stays.
                aside && 'max-md:hidden',
              )}
            >
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
            // ── ON PHONES THIS IS A LIGHT BLOCK, NOT PART OF THE PLATE ────
            // (2026-09-30, to the client's mockup) The card used to sit on
            // the same dusk as the words, so the hero was one unbroken dark
            // column a screen and a half long and the card read as more hero
            // rather than as the thing to do about it.
            //
            // `-mx-6` cancels the Body's own padding so the block goes edge
            // to edge, and `PlateFoot` above it draws the curve the dusk ends
            // on. The card itself is untouched — this is the ground it stands
            // on, not the card.
            //
            // From md none of it applies: the card sits in the 2fr column of
            // a full-bleed photographic hero, which is the layout that was
            // signed off.
            className="no-scrollbar w-full max-md:relative max-md:-mx-6 max-md:mt-0 max-md:w-auto max-md:bg-paper-2 max-md:px-6 max-md:pb-10 max-md:pt-12 md:ms-auto md:max-w-[640px] lg:max-h-[var(--project-card-cap)] lg:self-center lg:overflow-y-auto"
            // Straight from components/hero.tsx: full width of the 2fr
            // column, pushed to its far edge, capped at 640px — a cap
            // neither page reaches, because the column is what decides.
            // ms-auto not ml-auto: in Arabic the columns swap sides and
            // ml-auto would push the card back towards the text.
            //
            // What stays project-specific is the height cap. This hero has
            // to fit a 13-inch laptop with a three-step giving flow in it,
            // so the card scrolls inside itself rather than growing the
            // section.
            style={{ ['--project-card-cap' as string]: 'calc(100svh - 122px - clamp(12px, 100svh - 700px, 48px))' }}
          >
            <PlateFoot fill="#F2EEE7" className="pointer-events-none absolute inset-x-0 -top-12 h-12 w-full md:hidden" />
            {aside}
          </div>
        )}
        </div>
      </Body>
        );
      })()}
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
        <ul className="mt-14 max-md:mt-8 grid gap-x-10 gap-y-10 max-md:gap-y-6 md:grid-cols-2 lg:grid-cols-4">
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

