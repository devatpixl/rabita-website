import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SectionBody } from './primitives';

// The shape the Visit us section uses. The photograph comes first here, before any heading, because these pages answer where and when rather than why. Underneath it a rail of the three facts a visitor needs before setting off.
const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

// The three facts a visitor needs before setting off. Extracted from
// VisitHero on 2026-09-05 so /besok-oss can print the same rail under its
// new band without a second implementation of it — VisitHero's own markup
// is unchanged, which is what keeps the two events pages exactly as they
// were.
export function VisitFacts({
  facts,
  className,
}: {
  facts: { term: string; detail: string }[];
  className?: string;
}) {
  return (
    <ul className={[className, 'grid gap-x-10 gap-y-6 border-t border-rule pt-8 md:grid-cols-3'].filter(Boolean).join(' ')}>
      {facts.map((f) => (
        <li key={f.term}>
          <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-60">{f.term}</p>
          <p className="mt-2 font-serif text-[1.15rem] leading-snug text-ink">{f.detail}</p>
        </li>
      ))}
    </ul>
  );
}

export function VisitHero({
  crumb,
  eyebrow,
  title,
  lede,
  image,
  alt,
  facts,
}: {
  crumb: string;
  eyebrow: string;
  title: ReactNode;
  lede: string;
  image: string;
  alt: string;
  facts: { term: string; detail: string }[];
}) {
  return (
    <section className="bg-paper pt-section-sm pb-section-md">
      <SectionBody>
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-ink-60">{crumb}</p>

        <div className="relative mt-8 aspect-[21/9] w-full overflow-hidden rounded-3xl bg-paper-2">
          <Image src={image} alt={alt} fill priority sizes="(min-width: 1024px) 84vw, 92vw" className="object-cover" style={{ filter: GRADE }} />
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-6">
            {eyebrow !== crumb && (
              <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-gold-deep">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-4 font-serif text-display text-balance text-ink">{title}</h1>
          </div>
          <p className="md:col-span-6 max-w-prose self-end text-body text-ink-60">{lede}</p>
        </div>

        <VisitFacts facts={facts} className="mt-12" />
      </SectionBody>
    </section>
  );
}

// Closes on a photograph with the invitation set into it, so the last thing on the page is the door rather than a form.
export function VisitClose({
  heading,
  body,
  image,
  alt,
  primary,
  secondary,
}: {
  heading: ReactNode;
  body: string;
  image: string;
  alt: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="relative isolate overflow-hidden bg-dusk text-paper">
      <div className="absolute inset-0">
        <Image src={image} alt={alt} fill loading="eager" sizes="100vw" className="object-cover" style={{ filter: GRADE }} />
        <div aria-hidden className="absolute inset-0 bg-dusk/85" />
      </div>
      <SectionBody className="relative py-section-md text-center">
        <h2 className="mx-auto max-w-3xl font-serif text-section text-balance text-paper">{heading}</h2>
        <p className="mx-auto mt-5 max-w-prose text-body text-dusk-60">{body}</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={primary.href}
            className="inline-flex min-h-12 items-center rounded-full bg-gold-deep px-6 py-3 text-[15px] font-semibold text-paper transition-colors hover:bg-gold"
          >
            {primary.label}
          </Link>
          {secondary && (
            <Link
              href={secondary.href}
              className="inline-flex min-h-12 items-center rounded-full border border-paper/40 px-6 py-3 text-[15px] font-semibold text-paper transition-colors hover:border-paper"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </SectionBody>
    </section>
  );
}
