import type { ReactNode } from 'react';
import Image from 'next/image';
import { CAMPAIGN } from '@/lib/campaign';
import { SectionBody } from './primitives';
import { FigureIcon, type FigureIconName } from './figure-icons';
import { CopyValue } from './copy-value';

// The shape the About us section uses. No photograph in the hero at all, which is what separates it from the other four sections: these pages are the record of an organisation, so they open as a document and close on a colophon of the facts a reader might want to check.
const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

export function StoryHero({
  crumb,
  eyebrow,
  index,
  title,
  lede,
}: {
  crumb: string;
  eyebrow: string;
  index: string;
  title: ReactNode;
  lede: string;
}) {
  return (
    <section className="bg-paper pt-section-sm pb-section-md">
      <SectionBody>
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-ink-60">{crumb}</p>
        <div className="mt-10 border-t-2 border-ink pt-8">
          <p className="flex items-baseline gap-4 border-s border-gold-deep ps-4 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-ink-60">
            <span className="tabular-nums text-gold-deep">{index}</span>
            <span>{eyebrow}</span>
          </p>
          <h1 className="mt-6 max-w-4xl font-serif text-display text-balance text-ink">{title}</h1>
          <p className="mt-6 max-w-prose text-body text-ink-60">{lede}</p>
        </div>
      </SectionBody>
    </section>
  );
}

// One photograph on a hairline, captioned like a plate in a printed record.
export function StoryPlate({ image, caption }: { image: string; caption: string }) {
  return (
    <section className="bg-paper pb-section-md">
      <SectionBody>
        <figure>
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl bg-paper-2">
            <Image src={image} alt={caption} fill loading="eager" sizes="(min-width: 1024px) 84vw, 92vw" className="object-cover" style={{ filter: GRADE }} />
          </div>
          <figcaption className="mt-4 border-t border-rule pt-3 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-60">
            {caption}
          </figcaption>
        </figure>
      </SectionBody>
    </section>
  );
}

// The colophon: who the organisation is, in the terms a register would use.
//
// Third shape. It was six hairline rows (a table with no design), then two
// named registers of label/value pairs — which on a wide column put a 276px
// canyon between "STIFTET" and "1987" and stood a short list beside a tall
// empty half-column (client, 2026-09-08: "wtf is this? ewww").
//
// The label/value row was the whole problem: it can only ever be two things
// far apart. So the fact is now a CELL, with its label above its value and
// nothing between them, and the six cells make one continuous hairline grid
// rather than six floating cards — gap-px over a tinted ground, which is the
// only way to get unbroken interior rules that survive wrapping at every
// breakpoint. The heading sits across the top instead of down the side, so
// there is no tall column left over.
export type ColophonLabels = {
  founded: string;
  orgNr: string;
  members: string;
  address: string;
  hours: string;
  bank: string;
  eyebrow: string;
  register: string;
  copy: string;
  copied: string;
};

type ColophonFact = {
  icon: FigureIconName;
  term: string;
  detail: string;
  /** A second, quieter line under the value — the postcode under the street. */
  note?: string;
  /** Offer the value as a copy button. Only the two numbers worth taking. */
  copy?: boolean;
  /** Latin or numeric data: isolate it so Arabic cannot reorder the groups. */
  ltr?: boolean;
};

export function StoryColophon({
  heading,
  body,
  hours,
  labels,
}: {
  heading: ReactNode;
  body: string;
  hours: string;
  labels: ColophonLabels;
}) {
  // CAMPAIGN.address already ends in the city ("Calmeyers gate 8, Oslo"), so
  // appending postalCity printed the city twice. Split rather than retype.
  const street = CAMPAIGN.address.split(',')[0].trim();

  // Derived from the org number in the cell above it, so the link and the
  // figure can never disagree.
  const register = `https://data.brreg.no/enhetsregisteret/oppslag/enheter/${CAMPAIGN.orgNr.replace(/\s/g, '')}`;

  // Read straight from CAMPAIGN so the six pages that render this cannot
  // drift apart. Order runs institution -> money -> place -> time.
  const facts: ColophonFact[] = [
    { icon: 'calendar', term: labels.founded, detail: String(CAMPAIGN.foundedYear), ltr: true },
    { icon: 'building', term: labels.orgNr, detail: CAMPAIGN.orgNr, copy: true },
    { icon: 'people', term: labels.members, detail: CAMPAIGN.members.toLocaleString('nb-NO'), ltr: true },
    { icon: 'book', term: labels.bank, detail: CAMPAIGN.bankAccount, copy: true },
    { icon: 'pin', term: labels.address, detail: street, note: CAMPAIGN.postalCity, ltr: true },
    // The only value here that is translated prose, so the only one that
    // must follow the page's own direction.
    { icon: 'clock', term: labels.hours, detail: hours },
  ];

  return (
    // paper-2, not the paper-deep sand it closed on (client: "bg colour
    // change"). It also sets the page's last three grounds running pale
    // green -> near-white -> the dusk footer, which is a progression rather
    // than two warm sands meeting a dark block.
    <section className="relative isolate overflow-hidden bg-paper-2 py-9 md:py-section-md">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -start-32 -z-10 h-[26rem] w-[26rem] rounded-full bg-gold/[0.07] blur-3xl"
      />
      <SectionBody>
        {/* Across the top, not down the side. The link sits at the end of the
           same line as the text on a wide screen and drops under it when
           there is no room, so neither ever strands the other. */}
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-7">
          <div className="max-w-[44ch]">
            <div className="flex items-center gap-4">
              <p className="shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold-deep">
                {labels.eyebrow}
              </p>
              <span aria-hidden className="h-px w-14 bg-gold-deep/30" />
            </div>
            <h2 className="mt-4 font-serif text-section text-balance text-ink">{heading}</h2>
            <p className="mt-4 text-body text-ink-60">{body}</p>
          </div>

          {/* The one place a reader can check all of this against something
             that is not us. A plain anchor: it leaves the site. */}
          <a
            href={register}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex min-h-11 items-center gap-3.5 outline-none"
          >
            <span
              aria-hidden
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-gold-deep ring-1 ring-gold-deep/25 transition-colors duration-300 group-hover:bg-gold-deep group-hover:text-paper group-focus-visible:bg-gold-deep group-focus-visible:text-paper motion-reduce:transition-none"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 rtl:-scale-x-100"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h13M12 5l7 7-7 7" />
              </svg>
            </span>
            <span className="max-w-[22ch] text-start text-[15px] leading-snug text-ink underline decoration-gold-deep/30 [text-underline-offset:5px] transition-colors group-hover:decoration-gold-deep">
              {labels.register}
            </span>
          </a>
        </div>

        {/* One block divided into six, not six blocks. gap-px over a tinted
           ground draws the interior rules: real borders would double up at
           every seam and break wherever the grid rewraps. */}
        <dl className="mt-7 grid gap-px md:mt-10 overflow-hidden rounded-2xl bg-ink/10 ring-1 ring-ink/10 shadow-[0_1px_2px_rgba(26,26,24,0.03),0_18px_40px_-32px_rgba(26,26,24,0.25)] sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((f) => (
            <div
              key={f.term}
              className="group relative bg-paper p-6 transition-colors duration-200 hover:bg-gold-soft/15 sm:p-7"
            >
              {/* The gold rule draws in along the cell's top edge — the house
                 hover, turned to match a cell rather than a row. */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gold-deep transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none rtl:origin-right"
              />
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold-soft/40 text-gold-deep ring-1 ring-gold-deep/20"
                >
                  <FigureIcon name={f.icon} className="h-[17px] w-[17px]" />
                </span>
                <dt className="font-mono text-[0.625rem] uppercase leading-snug tracking-[0.16em] text-ink-60">
                  {f.term}
                </dt>
              </div>
              <dd className="mt-4 font-serif text-[1.45rem] leading-tight tabular-nums text-ink">
                {f.copy ? (
                  <CopyValue value={f.detail} copyLabel={labels.copy} copiedLabel={labels.copied} />
                ) : f.ltr ? (
                  <bdi dir="ltr">{f.detail}</bdi>
                ) : (
                  f.detail
                )}
                {f.note && (
                  <span className="mt-1 block text-[0.95rem] text-ink-60">
                    <bdi dir="ltr">{f.note}</bdi>
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </SectionBody>
    </section>
  );
}
