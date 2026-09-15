import { getTranslations } from 'next-intl/server';
import { Accent } from './accent';
import { SectionBody } from './primitives';
import { CHANNELS, CHANNEL_RGB, ChannelMark } from './social-marks';

// "Follow us", closing the homepage (client, 2026-08-31).
//
// The brief asked for a section rather than another logo row — the footer
// already carries three plain text links, and repeating them would say the
// same thing twice in the same colour. So each channel is a card that answers
// "why would I follow THIS one": the mark, the handle, and one line of what
// actually gets posted there. Three different answers, three reasons.
//
// The marks are each platform's real logo in its real colours (client,
// 2026-09-12). They live in social-marks.tsx now, shared with the footer
// row added 2026-09-16 — the reasoning for the glyphs themselves went with
// them, and the channel list and URLs with it.
//
// This reverses the note that stood here, which argued that four saturated
// logos "on a dusk band would be the loudest thing on the page". Half of that
// objection went away on 2026-09-04 when the section moved off dusk onto the
// pale sage below — colour at 12% on a near-white card is not the same
// proposition as colour on a dark band. The other half is answered by how
// little of it there is: the seal, its ring, the 24px mark and the ghosted
// watermark. The card, the type and the FOLLOW link are untouched, so the row
// still reads in the site's own voice and the colour only says which platform
// you are looking at, which was the client's point — four gold cards told
// them apart by logo silhouette alone.
//
// One flat colour each, not Instagram's real four-stop gradient: a gradient
// seal beside three flat ones is inconsistent at rest, and the gradient is
// the kind of detail that reads as a pasted-in widget.
//
// Sage ground, not dusk (client, 2026-09-04): on dusk this section read as
// part of the footer below it — one undifferentiated dark mass. It now sits
// on the same pale green the "Dette er Rabita" section owns, which separates
// it from the footer at a glance and bookends the page in the same colour.
//
// WhatsApp joined the list the same day. There is still no official channel
// URL anywhere in the project, so the card opens a chat with the mosque's
// own phone number via wa.me — TODO: swap for the real channel/community
// link when the client provides one.


export async function FollowUs() {
  const t = await getTranslations('followUs');
  const tSocial = await getTranslations('footer.social');

  return (
    <section
      aria-labelledby="follow-us-heading"
      className="bg-[#e3eae4] py-12 text-ink md:py-section-md"
    >
      <SectionBody>
        {/* The "Follow us" eyebrow came out on 2026-08-31 (client). The
           headline and the three channel cards already say what this is, so
           the label was only repeating the section back to itself. The
           translation stays in messages/*.json under followUs.eyebrow. */}
        <h2
          id="follow-us-heading"
          className="max-w-2xl font-serif text-section text-balance text-ink"
        >
          {t.rich('title', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
        </h2>
        <p className="mt-4 max-w-[42ch] text-pretty text-body text-ink-60">{t('lede')}</p>

        {/* A swipe rail on a phone, three across from sm — the same pattern the
           costed gifts use on /moskeprosjektet, so the two read as one system.
           Cards sit at 78% so the next one peeks in and the row reads as
           swipeable without needing a hint. */}
        <ul className="no-scrollbar -mx-1 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 sm:overflow-visible sm:px-0 md:mt-10">
          {CHANNELS.map(({ key, href }) => (
            <li key={key} className="w-[78%] shrink-0 snap-start sm:w-auto sm:shrink">
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                /* One variable per card, so every coloured part below is a
                   static class the Tailwind scanner can see — a class name
                   built from `key` at runtime would never be generated. */
                style={
                  {
                    '--ch': `rgb(${CHANNEL_RGB[key]})`,
                    '--ch-tint': `rgb(${CHANNEL_RGB[key]} / 0.12)`,
                    '--ch-tint-hi': `rgb(${CHANNEL_RGB[key]} / 0.2)`,
                    '--ch-ring': `rgb(${CHANNEL_RGB[key]} / 0.3)`,
                    '--ch-ring-hi': `rgb(${CHANNEL_RGB[key]} / 0.55)`,
                    '--ch-edge': `rgb(${CHANNEL_RGB[key]} / 0.55)`,
                  } as React.CSSProperties
                }
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-rule bg-paper p-5 transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:border-[color:var(--ch-edge)] hover:shadow-[0_18px_36px_-24px_rgba(28,25,23,0.45)] md:p-6"
              >
                {/* The channel's own mark again, oversized and ghosted off
                   the corner — each card carries its identity at two scales,
                   which is what four identical white rectangles were
                   missing. It leans in a touch further on hover. */}
                <ChannelMark
                  channel={key}
                  instance={`${key}-ghost`}
                  className="pointer-events-none absolute -end-5 -top-5 h-28 w-28 opacity-[0.07] transition-[transform,opacity] duration-500 ease-out group-hover:-translate-x-1 group-hover:translate-y-1 group-hover:opacity-[0.12] rtl:group-hover:translate-x-1"
                />
                {/* The mark proper, in a seal. On hover the seal fills and
                   the mark flips to paper — one clear beat per card. */}
                {/* The hover beat is the seal deepening under the mark, not
                   the mark itself changing. It used to fill gold and flip the
                   glyph to paper, which a real logo cannot do — recolouring
                   a brand mark is the one thing every brand guideline
                   forbids, and a white Instagram camera is not the Instagram
                   logo. So the tint and the ring move and the logo holds
                   still. */}
                <span className="relative grid h-12 w-12 place-items-center rounded-full bg-[color:var(--ch-tint)] ring-1 ring-[color:var(--ch-ring)] transition-colors duration-300 group-hover:bg-[color:var(--ch-tint-hi)] group-hover:ring-[color:var(--ch-ring-hi)]">
                  <ChannelMark channel={key} instance={`${key}-seal`} className="h-6 w-6" />
                </span>

                <p className="mt-6 font-serif text-[1.15rem] leading-tight text-ink md:text-[1.25rem]">
                  {tSocial(key)}
                </p>
                <p className="mt-1 break-all font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-40">
                  {t(`channels.${key}.handle`)}
                </p>

                <p className="mt-4 text-[0.9rem] leading-snug text-ink-60">
                  {t(`channels.${key}.blurb`)}
                </p>

                {/* mt-auto so the action sits on one line across all three
                   cards however long the blurb above it runs. */}
                <span className="mt-auto flex items-center gap-2 pt-6 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold-deep">
                  {t('action')}
                  <span
                    aria-hidden
                    className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  >
                    &rarr;
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </SectionBody>
    </section>
  );
}

