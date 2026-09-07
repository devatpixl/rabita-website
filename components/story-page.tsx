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
// The six facts, grouped and named (client mockup, 2026-09-08). They used to
// be one undifferentiated run of six hairline rows, which is a table of
// contents with no contents: nothing told you that four of them describe an
// organisation and two of them describe a place you can walk to. Now each
// register carries its own mark and title, and the two numbers a journalist
// or an auditor actually came for can be taken away with one click.
export type ColophonLabels = {
  founded: string;
  orgNr: string;
  members: string;
  address: string;
  hours: string;
  bank: string;
  eyebrow: string;
  groupOrg: string;
  groupVisit: string;
  register: string;
  copy: string;
  copied: string;
};

// `ltr` marks a value that is Latin or numeric data rather than translated
// prose. Without it Arabic reorders the digit groups and the register lies:
// 983 228 364 renders as 364 228 983, and 0183 Oslo as Oslo 0183.
type ColophonRow = {
  term: string;
  detail: string;
  note?: string;
  copy?: boolean;
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
  // appending postalCity printed "Calmeyers gate 8, Oslo, 0183 Oslo" on all
  // six pages that render this. Split rather than retype: the street stays
  // tied to the constant, and the postcode goes on its own line the way an
  // address is actually written.
  const street = CAMPAIGN.address.split(',')[0].trim();

  // Derived from the org number printed two rows above it, so the link and
  // the figure can never disagree.
  const register = `https://data.brreg.no/enhetsregisteret/oppslag/enheter/${CAMPAIGN.orgNr.replace(/\s/g, '')}`;

  // Read straight from CAMPAIGN so the six pages in this section cannot drift
  // apart.
  const groups: { icon: FigureIconName; title: string; rows: ColophonRow[] }[] = [
    {
      icon: 'building',
      title: labels.groupOrg,
      rows: [
        { term: labels.founded, detail: String(CAMPAIGN.foundedYear), ltr: true },
        { term: labels.orgNr, detail: CAMPAIGN.orgNr, copy: true },
        { term: labels.members, detail: CAMPAIGN.members.toLocaleString('nb-NO'), ltr: true },
        { term: labels.bank, detail: CAMPAIGN.bankAccount, copy: true },
      ],
    },
    {
      icon: 'pin',
      title: labels.groupVisit,
      rows: [
        { term: labels.address, detail: street, note: CAMPAIGN.postalCity, ltr: true },
        // The only value here that is translated prose, so the only one that
        // must follow the page's own direction.
        { term: labels.hours, detail: hours },
      ],
    },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-paper-deep py-section-md">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -start-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-gold/[0.07] blur-3xl"
      />
      <SectionBody>
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          {/* ── what this is ───────────────────────────────────────── */}
          <div className="md:col-span-4">
            {/* The eyebrow's rule runs to the right of the words rather than
               before them, which is the mockup's, and it is the right way
               round here: it ties the label to the registers beside it
               instead of stopping the eye at the margin. */}
            <div className="flex items-center gap-4">
              <p className="shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold-deep">
                {labels.eyebrow}
              </p>
              <span aria-hidden className="h-px flex-1 bg-gold-deep/30" />
            </div>
            <h2 className="mt-5 font-serif text-section text-balance text-ink">{heading}</h2>
            <p className="mt-5 max-w-prose text-body text-ink-60">{body}</p>

            {/* The one place a reader can check all of this against something
               that is not us. A plain anchor, not next/link: it leaves the
               site. */}
            <a
              href={register}
              target="_blank"
              rel="noreferrer"
              className="group mt-8 inline-flex min-h-11 items-center gap-4 outline-none"
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
              <span className="max-w-[26ch] text-start text-[15px] leading-snug text-ink underline decoration-gold-deep/35 [text-underline-offset:5px] transition-colors group-hover:decoration-gold-deep">
                {labels.register}
              </span>
            </a>
          </div>

          {/* ── the registers ──────────────────────────────────────── */}
          <div className="space-y-10 md:col-span-8">
            {groups.map((g) => (
              <div key={g.title}>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold-soft/40 text-gold-deep ring-1 ring-gold-deep/20"
                  >
                    <FigureIcon name={g.icon} className="h-4 w-4" />
                  </span>
                  <h3 className="shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-60">
                    {g.title}
                  </h3>
                  <span aria-hidden className="h-px flex-1 bg-gold-deep/25" />
                </div>

                <dl className="mt-1.5">
                  {g.rows.map((r, i) => (
                    <div
                      key={r.term}
                      className="group relative -mx-3 grid gap-x-8 rounded-lg px-3 py-4 transition-colors duration-200 hover:bg-paper/70 md:grid-cols-12 md:items-baseline"
                    >
                      {/* The hairline is drawn rather than bordered so it
                         stays flush with the text while the tint runs 12px
                         wider on both sides. */}
                      {i > 0 && (
                        <span aria-hidden className="absolute inset-x-3 top-0 h-px bg-ink/10" />
                      )}
                      {/* The house start-edge rule, as on the assurance list
                         and the service offer. */}
                      <span
                        aria-hidden
                        className="absolute inset-y-2.5 start-0 w-px origin-top scale-y-0 bg-gold-deep transition-transform duration-300 group-hover:scale-y-100 motion-reduce:transition-none"
                      />
                      <dt className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-60 md:col-span-5">
                        {r.term}
                      </dt>
                      <dd className="mt-1 font-serif text-[1.15rem] tabular-nums text-ink md:col-span-7 md:mt-0">
                        {r.copy ? (
                          <CopyValue
                            value={r.detail}
                            copyLabel={labels.copy}
                            copiedLabel={labels.copied}
                          />
                        ) : r.ltr ? (
                          <bdi dir="ltr">{r.detail}</bdi>
                        ) : (
                          r.detail
                        )}
                        {r.note && (
                          <span className="mt-0.5 block text-[0.95rem] text-ink-60">
                            <bdi dir="ltr">{r.note}</bdi>
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </SectionBody>
    </section>
  );
}
