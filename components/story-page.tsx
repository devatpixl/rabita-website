import type { ReactNode } from 'react';
import Image from 'next/image';
import { CAMPAIGN } from '@/lib/campaign';
import { SectionBody } from './primitives';

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
        <div className="mt-10 grid gap-8 border-t-2 border-ink pt-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-3">
            <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] tabular-nums text-gold-deep">{index}</p>
            <p className="mt-3 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-ink-60">{eyebrow}</p>
          </div>
          <div className="md:col-span-9">
            <h1 className="font-serif text-display text-balance text-ink">{title}</h1>
            <p className="mt-6 max-w-prose text-body text-ink-60">{lede}</p>
          </div>
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
export function StoryColophon({
  heading,
  body,
  hours,
  labels,
}: {
  heading: ReactNode;
  body: string;
  hours: string;
  labels: { founded: string; orgNr: string; members: string; address: string; hours: string; bank: string };
}) {
  // Read straight from CAMPAIGN so the five pages in this section cannot drift apart
  const facts = [
    { term: labels.founded, detail: String(CAMPAIGN.foundedYear) },
    { term: labels.orgNr, detail: CAMPAIGN.orgNr },
    { term: labels.members, detail: CAMPAIGN.members.toLocaleString('nb-NO') },
    { term: labels.address, detail: `${CAMPAIGN.address}, ${CAMPAIGN.postalCity}` },
    { term: labels.hours, detail: hours },
    { term: labels.bank, detail: CAMPAIGN.bankAccount },
  ];

  return (
    <section className="bg-paper-deep py-section-md">
      <SectionBody>
        <div className="grid gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <h2 className="font-serif text-section text-balance text-ink">{heading}</h2>
            <p className="mt-5 max-w-prose text-body text-ink-60">{body}</p>
          </div>
          <dl className="md:col-span-8">
            {facts.map((f) => (
              <div key={f.term} className="grid gap-x-8 border-t border-rule py-4 md:grid-cols-12 md:items-baseline">
                <dt className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-60 md:col-span-4">{f.term}</dt>
                <dd className="font-serif text-[1.15rem] tabular-nums text-ink md:col-span-8">{f.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </SectionBody>
    </section>
  );
}
