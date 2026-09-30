import { getTranslations } from 'next-intl/server';
import { Section, SectionBody } from './primitives';
import { RosetteMark } from './marks';
import type { ServiceKey } from '@/lib/services';

/**
 * The three middle sections of a service page, drawn for a phone.
 *
 * ── WHY IT IS A SEPARATE COMPONENT (2026-09-30) ──────────────────────────
 * The desktop version is a twelve-column split, a three-across offer row and
 * a ruled step list — all three are shapes that want width. Stacked at 390px
 * they became three runs of unbroken prose with a bullet list in the middle,
 * which is what the client sent back.
 *
 * This is a paired branch (`md:hidden` here, `max-md:hidden` there) rather
 * than a pile of `max-md:` overrides, because almost nothing survives the
 * translation: the plate, the cards and the timeline do not exist upstairs,
 * and the split and the ruled list do not exist here. From md the page is
 * byte-identical to what shipped.
 *
 * ── WHAT IS REAL COPY AND WHAT IS NOT ────────────────────────────────────
 * Everything rendered here is the client's own text. Two keys are new and
 * both are compressions of his sentences, not new claims:
 *   items.<s>.longBodyShort  — the opening paragraph at phone length. Falls
 *                              back to longBody where a service has none, so
 *                              the other seventeen keep working untouched.
 *   detail.journey           — a label, "Your journey", above "How it works".
 *
 * The mockup also carried a headline and a lede over the offer cards, and a
 * one-line description inside each of them. Those are NOT written here: the
 * descriptions in it are the steps' own bodies, which appear in the section
 * directly below, and the headline and lede exist nowhere in the content. A
 * card with a title is honest; a card with invented prose is not.
 */
export async function ServiceOverviewPhone({ s }: { s: ServiceKey }) {
  const t = await getTranslations('servicesIndex');
  const offer = t.has(`items.${s}.offer`)
    ? (t.raw(`items.${s}.offer`) as { title: string; body?: string }[])
    : [];
  const steps = t.has(`items.${s}.steps`)
    ? (t.raw(`items.${s}.steps`) as { title: string; body: string }[])
    : [];
  const lede = t(`items.${s}.offerLede`);
  // The plate quotes the FIRST sentence of his lede, which is the line that
  // carries the invitation; the rest qualifies it and reads as a paragraph.
  const sentences = lede.split(/(?<=[.!?])\s+/);
  const pull = sentences[0] ?? lede;
  // ...and the REST of that lede becomes the offer section's standfirst. It
  // was being dropped on phones entirely, which is both a waste of his words
  // and the reason that section had a heading and then bare cards.
  const offerLedeRest = sentences.slice(1).join(' ').trim();
  const body = t.has(`items.${s}.longBodyShort`)
    ? t(`items.${s}.longBodyShort`)
    : t.has(`items.${s}.longBody`)
      ? t(`items.${s}.longBody`)
      : null;

  return (
    <div className="md:hidden">
      {/* ── ABOUT ──────────────────────────────────────────────────────── */}
      <Section tone="paper" className="relative isolate overflow-hidden py-11">
        {/* The arch, very faint, bleeding off the foot — the building's own
           doorway used as a watermark rather than an illustration. */}
        <RosetteMark
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -end-14 -z-10 h-56 w-56 text-gold-deep/[0.06]"
        />
        <SectionBody>
          <span aria-hidden className="block h-px w-full bg-gold-deep/45" />
          <p className="mt-6 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-gold-deep">
            {t('detail.about')}
          </p>
          <h2 className="mt-3 max-w-[13ch] font-serif text-[2rem] leading-[1.08] tracking-[-0.015em] text-ink">
            {t(`items.${s}.offerTitle`)}
          </h2>
          {body && <p className="mt-5 text-[1rem] leading-[1.62] text-ink-60">{body}</p>}

          {/* The plate: his own invitation, set as the one quiet claim on the
             screen, with the page's single action under it. */}
          <div className="mt-7 rounded-2xl bg-paper-2 px-5 py-6">
            <StarGlyph className="h-7 w-7 text-gold-deep" />
            <p className="mt-4 font-serif text-[1.2rem] leading-[1.35] text-ink">{pull}</p>
            <a
              href="#enquiry"
              className="group mt-5 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-gold-deep"
            >
              <span className="border-b border-gold-deep/50 pb-1">{t('detail.request')}</span>
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
                &rarr;
              </span>
            </a>
          </div>
        </SectionBody>
      </Section>

      {/* ── WHAT WE OFFER ──────────────────────────────────────────────── */}
      {offer.length > 0 && (
        <Section tone="paper" className="relative isolate overflow-hidden py-11 pt-0">
          <RosetteMark
            aria-hidden
            className="pointer-events-none absolute -top-10 -end-12 -z-10 h-44 w-44 text-gold-deep/[0.07]"
          />
          <RosetteMark
            aria-hidden
            className="pointer-events-none absolute -bottom-14 -start-16 -z-10 h-48 w-48 text-gold-deep/[0.05]"
          />
          <SectionBody>
            {/* A rule, then the label AS the heading — the mockup's shape is
               eyebrow, headline, standfirst, and the site has one string for
               this section, so it is set as the headline rather than printed
               twice at two sizes. */}
            <span aria-hidden className="block h-px w-10 bg-gold-deep/45" />
            <h2 className="mt-5 max-w-[13ch] font-serif text-[2rem] leading-[1.08] tracking-[-0.015em] text-ink">
              {t('detail.what')}
            </h2>
            {offerLedeRest && (
              <p className="mt-4 text-[1rem] leading-[1.62] text-ink-60">{offerLedeRest}</p>
            )}
            {/* ── A BULLET, NOT AN ICON (client, 2026-09-30) ─────────────
               The mockup gave each card a little drawing of what it
               describes. Doing that honestly means 54 of them — three for
               each of eighteen services — and this repo already records
               where that road goes: eight service marks were drawn once and
               the client's verdict was that they look fake, which they did.
               A generic star in a circle was the compromise, and he did not
               like that either, rightly: it said nothing about the item it
               sat beside.

               So the card carries the gold diamond the site already uses as
               its bullet, at the size the lost tile leaves room for. It is
               the page's own mark rather than a new one, and it claims
               nothing about the item. */}
            <ul className="mt-7 space-y-3.5">
              {offer.map((o) => (
                <li
                  key={o.title}
                  className="flex items-start gap-3.5 rounded-2xl border border-gold-deep/20 bg-paper px-5 py-6"
                >
                  <span aria-hidden className="mt-[0.5rem] block h-2 w-2 shrink-0 rotate-45 bg-gold-deep" />
                  <div className="min-w-0">
                    <p className="font-serif text-[1.2rem] leading-[1.3] text-ink">{o.title}</p>
                    {o.body && (
                      <p className="mt-2 text-[0.875rem] leading-[1.55] text-ink-60">{o.body}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </SectionBody>
        </Section>
      )}

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      {steps.length > 0 && (
        <Section tone="paper-2" className="relative isolate overflow-hidden py-11">
          <SectionBody>
            <div className="flex items-center gap-4">
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-gold-deep">
                {t('detail.journey')}
              </p>
              <span aria-hidden className="h-px w-10 bg-gold-deep/45" />
            </div>
            <h2 className="mt-3 font-serif text-[2rem] leading-[1.08] tracking-[-0.015em] text-ink">
              {t('detail.steps')}
            </h2>

            {/* The thread runs behind the discs and stops at the last one, so
               the column reads as a journey with an end rather than a list
               that was cut off. `last:before:hidden` is what ends it. */}
            <ol className="mt-7">
              {steps.map((st, i) => (
                <li
                  key={st.title}
                  className="relative flex gap-4 pb-7 last:pb-0 before:absolute before:top-10 before:bottom-0 before:start-[1.1875rem] before:w-px before:bg-gold-deep/25 last:before:hidden"
                >
                  <span className="relative z-[1] grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-deep font-mono text-[0.75rem] font-medium tabular-nums text-paper">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 pt-1">
                    <h3 className="font-serif text-[1.25rem] leading-[1.2] text-ink">{st.title}</h3>
                    <p className="mt-1.5 text-[0.875rem] leading-[1.55] text-ink-60">{st.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <span aria-hidden className="mt-9 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-gold-deep/25" />
              <StarGlyph className="h-4 w-4 text-gold-deep/60" />
              <span className="h-px w-12 bg-gold-deep/25" />
            </span>
          </SectionBody>
        </Section>
      )}
    </div>
  );
}

/**
 * An eight-point girih star at ICON scale.
 *
 * RosetteMark is the site's real rosette and it is a construction drawing on
 * a 480-unit board — circles, radii, the two squares it is struck from. That
 * is right at 380px on a plate and illegible at 20, where it collapses into a
 * grey smudge. This is the same eight-point figure reduced to the two
 * overlaid squares that actually read at this size, on a 24-unit board with a
 * stroke that survives.
 */
function StarGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 2.5 15.2 8.8 21.5 12 15.2 15.2 12 21.5 8.8 15.2 2.5 12 8.8 8.8Z" />
      <path d="M4.6 4.6h14.8v14.8H4.6Z" opacity="0.45" />
    </svg>
  );
}
