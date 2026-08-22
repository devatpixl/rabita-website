import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SectionBody } from './primitives';

// The shape the Education section uses. Not the mosque project hero and not the split hero from prayer and services: this one is centred type with nothing beside it, then one photograph running the full width of the screen. A prospectus, in other words.
const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

export function LearnHero({
  crumb,
  eyebrow,
  title,
  lede,
  image,
  caption,
}: {
  crumb: string;
  eyebrow: string;
  title: ReactNode;
  lede: string;
  image: string;
  caption: string;
}) {
  return (
    <section className="bg-paper-deep pt-section-sm pb-section-sm">
      <SectionBody className="text-center">
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-ink-60">{crumb}</p>
        <div className="mt-10 flex flex-col items-center">
          <h1 className="max-w-4xl font-serif text-display text-balance text-ink">{title}</h1>
          <p className="mt-6 max-w-2xl text-body text-ink-60">{lede}</p>
        </div>
      </SectionBody>

      {/* Held inside the measure and rounded like every other picture on the site, rather than bled to the window edge */}
      <SectionBody>
        <figure className="mt-14">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl bg-paper-2">
            <Image
              src={image}
              alt={caption}
              fill
              priority
              sizes="(min-width: 1024px) 84vw, 92vw"
              className="object-cover"
              style={{ filter: GRADE }}
            />
          </div>
          <figcaption className="mt-4 border-t border-rule pt-3 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-60">
            {caption}
          </figcaption>
        </figure>
      </SectionBody>
    </section>
  );
}

// Closes the section on the practical question: how a parent actually enrols a child.
export function LearnClose({
  heading,
  body,
  image,
  alt,
  items,
  cta,
}: {
  heading: ReactNode;
  body: string;
  image: string;
  alt: string;
  items: { term: string; detail: string }[];
  cta: { label: string; href: string };
}) {
  return (
    <section className="bg-paper-2 py-section-md">
      <SectionBody>
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-paper">
              <Image src={image} alt={alt} fill loading="eager" sizes="(min-width: 768px) 42vw, 90vw" className="object-cover" style={{ filter: GRADE }} />
            </div>
          </div>
          <div className="md:col-span-7">
            <h2 className="font-serif text-section text-balance text-ink">{heading}</h2>
            <p className="mt-5 max-w-prose hyphens-auto text-justify text-body text-ink-60">{body}</p>
            <dl className="mt-8 border-t border-rule">
              {items.map((it) => (
                <div key={it.term} className="grid gap-x-6 border-b border-rule py-4 md:grid-cols-12 md:items-baseline">
                  <dt className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-gold-deep md:col-span-4">{it.term}</dt>
                  <dd className="text-body text-ink-60 md:col-span-8">{it.detail}</dd>
                </div>
              ))}
            </dl>
            <Link
              href={cta.href}
              className="mt-8 inline-flex min-h-12 items-center rounded-full bg-gold-deep px-6 py-3 text-[15px] font-semibold text-paper transition-colors hover:bg-ink"
            >
              {cta.label}
            </Link>
          </div>
        </div>
      </SectionBody>
    </section>
  );
}
