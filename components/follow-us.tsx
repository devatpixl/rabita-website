import { getTranslations } from 'next-intl/server';
import { Accent } from './accent';
import { SectionBody } from './primitives';
import { CAMPAIGN } from '@/lib/campaign';

// "Follow us", closing the homepage (client, 2026-08-31).
//
// The brief asked for a section rather than another logo row — the footer
// already carries three plain text links, and repeating them would say the
// same thing twice in the same colour. So each channel is a card that answers
// "why would I follow THIS one": the mark, the handle, and one line of what
// actually gets posted there. Three different answers, three reasons.
//
// The marks are drawn in the site's own line language (1.5 stroke, round caps)
// rather than dropped in as brand-coloured logos. Four saturated logos on a
// dusk band would be the loudest thing on the page, and they would be the only
// place on the site where a colour arrives from outside the palette.
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

const CHANNELS = [
  { key: 'instagram', href: 'https://instagram.com/detislamskeforbundet/' },
  { key: 'facebook', href: 'https://facebook.com/detislamskeforbundet/' },
  { key: 'tiktok', href: 'https://tiktok.com/@oslomosque' },
  { key: 'whatsapp', href: `https://wa.me/${CAMPAIGN.contactPhone.replace(/[^\d]/g, '')}` },
] as const;

type ChannelKey = (typeof CHANNELS)[number]['key'];

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
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-rule bg-paper p-5 transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:border-gold-deep/60 hover:shadow-[0_18px_36px_-24px_rgba(28,25,23,0.45)] md:p-6"
              >
                {/* The channel's own mark again, oversized and ghosted off
                   the corner — each card carries its identity at two scales,
                   which is what four identical white rectangles were
                   missing. It leans in a touch further on hover. */}
                <ChannelMark
                  channel={key}
                  className="pointer-events-none absolute -end-5 -top-5 h-28 w-28 text-gold-deep/[0.08] transition-transform duration-500 ease-out group-hover:-translate-x-1 group-hover:translate-y-1 group-hover:text-gold-deep/[0.12] rtl:group-hover:translate-x-1"
                />
                {/* The mark proper, in a seal. On hover the seal fills and
                   the mark flips to paper — one clear beat per card. */}
                <span className="relative grid h-12 w-12 place-items-center rounded-full bg-gold-soft/50 ring-1 ring-gold-deep/25 transition-colors duration-300 group-hover:bg-gold-deep group-hover:ring-gold-deep">
                  <ChannelMark
                    channel={key}
                    className="h-6 w-6 text-gold-deep transition-colors duration-300 group-hover:text-paper"
                  />
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

// Line-drawn marks, not brand logos — see the note at the top of the file.
// One stroke weight, one cap style, so the three read as a set.
function ChannelMark({ channel, className }: { channel: ChannelKey; className?: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };

  if (channel === 'instagram') {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (channel === 'facebook') {
    // The f silhouette, outlined. An earlier hand-drawn version was a bare
    // stroke "f" and read as a serif glyph rather than as Facebook.
    return (
      <svg {...common}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }

  if (channel === 'tiktok') {
    // The note, in one stroke: the round head bottom-left, the stem up
    // through the body, and the flag reaching to the top right.
    return (
      <svg {...common}>
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    );
  }

  // WhatsApp — bubble with its tail and the handset, from Tabler's
  // brand-whatsapp (MIT), which is already in this set's stroke language.
  // A first hand-drawn attempt read as a scribble at 24px.
  return (
    <svg {...common}>
      <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
      <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
    </svg>
  );
}
