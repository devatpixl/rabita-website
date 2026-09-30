import { getTranslations } from 'next-intl/server';
import { Accent } from './accent';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { Section, SectionBody } from './primitives';
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
          {/* The mosque's own mark, top-end, large and faint (client,
             2026-09-30: "on top right it uses in bg the rabita logo"). The
             real logo rather than RosetteMark: the rosette is a construction
             drawing of the geometry, and what he is pointing at is the
             identity. Bled off both edges so it reads as a watermark the
             section is printed over, not a sticker in the corner. */}
          <Image
            src="/logo/rabita-mark-256.png"
            alt=""
            aria-hidden
            width={256}
            height={256}
            className="pointer-events-none absolute -top-10 -end-12 -z-10 h-44 w-44 opacity-[0.07]"
          />
          <SectionBody>
            {/* Eyebrow, then a headline of its own — the mockup's shape, and
               the client asked for both rather than the label doing double
               duty at heading size. detail.whatHeading is new and GENERIC: it
               is true of every one of the eighteen services, makes no claim
               about any of them, and carries one accented word the way every
               other headline on this site does. */}
            <div className="flex items-center gap-4">
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-gold-deep">
                {t('detail.what')}
              </p>
              <span aria-hidden className="h-px w-10 bg-gold-deep/45" />
            </div>
            <h2 className="mt-4 max-w-[12ch] font-serif text-[2.35rem] leading-[1.04] tracking-[-0.02em] text-ink">
              {t.rich('detail.whatHeading', {
                em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
              })}
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
            <ul className="mt-8 space-y-4">
              {offer.map((o) => (
                <li
                  key={o.title}
                  className="flex items-start gap-4 rounded-[1.25rem] border border-gold-deep/35 bg-paper px-5 py-6 shadow-[0_1px_0_rgba(155,127,74,0.06)]"
                >
                  <span aria-hidden className="mt-[0.55rem] block h-2 w-2 shrink-0 rotate-45 bg-gold-deep" />
                  <div className="min-w-0">
                    <p className="font-serif text-[1.25rem] leading-[1.28] text-ink">{o.title}</p>
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
        <Section tone="paper-2" className="relative isolate overflow-hidden py-12">
          {/* The same corner mark as the section above, and the same file.
             It was RosetteMark — the geometry's construction drawing — which
             at this size and opacity read as a stray artefact rather than a
             mark. The client's words were that it looks fake, and it did. */}
          <Image
            src="/logo/rabita-mark-256.png"
            alt=""
            aria-hidden
            width={256}
            height={256}
            className="pointer-events-none absolute -top-10 -end-12 -z-10 h-44 w-44 opacity-[0.07]"
          />
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
               that was cut off. `last:before:hidden` is what ends it.

               The hairline between steps sits on the CONTENT column, not on
               the row, so it starts where the text starts and the thread runs
               through the gap uninterrupted — which is what the mockup does
               and what makes the discs read as beads on one line rather than
               as three separate rows. */}
            <ol className="mt-9">
              {steps.map((st, i) => (
                <li
                  key={st.title}
                  className="relative flex gap-5 pb-9 last:pb-0 before:absolute before:top-11 before:bottom-0 before:start-[1.1875rem] before:w-px before:bg-gold-deep/30 last:before:hidden"
                >
                  <span className="relative z-[1] grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-deep font-mono text-[0.75rem] font-medium tabular-nums text-paper">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div
                    className={cn(
                      'min-w-0 flex-1',
                      i === 0 ? 'pt-1' : 'border-t border-gold-deep/15 pt-6',
                    )}
                  >
                    <h3 className="max-w-[15ch] font-serif text-[1.35rem] leading-[1.15] text-ink">{st.title}</h3>
                    <p className="mt-2.5 text-[0.875rem] leading-[1.6] text-ink-60">{st.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Bigger, and the real mark (client, 2026-09-30: "make this
               bigger on mobile only, so noticeable"). It was a 16px glyph
               between two hairlines and read as a speck; the mark is 32px
               now, the rules are longer and a shade stronger, and the whole
               thing sits further down. Phones only — this component is
               md:hidden, so there is nothing to gate. */}
            <span aria-hidden className="mt-12 flex items-center justify-center gap-4">
              <span className="h-px w-20 bg-gold-deep/35" />
              <Image src="/logo/rabita-mark-256.png" alt="" aria-hidden width={256} height={256} className="h-8 w-8 opacity-70" />
              <span className="h-px w-20 bg-gold-deep/35" />
            </span>
          </SectionBody>
        </Section>
      )}
    </div>
  );
}

