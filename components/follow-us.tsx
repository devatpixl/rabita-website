import { getTranslations } from 'next-intl/server';
import { Accent } from './accent';
import { SectionBody } from './primitives';

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
// Dusk ground, and the footer below is dusk too — the bottom hairline is what
// keeps the two from reading as one undifferentiated dark mass. It uses
// paper/15, not paper/12: /12 does not get generated in this project (the
// footer's own dividers use it and fall back to Tailwind's default gray-200),
// so a /12 hairline would paint cold light grey on dusk instead of warm.
//
// WhatsApp was in the original brief but is not here: the client's final list
// was Instagram / Facebook / TikTok, and there is no WhatsApp channel URL
// anywhere in the project (the only reference is a share link on /takk).

const CHANNELS = [
  { key: 'instagram', href: 'https://instagram.com/detislamskeforbundet/' },
  { key: 'facebook', href: 'https://facebook.com/detislamskeforbundet/' },
  { key: 'tiktok', href: 'https://tiktok.com/@oslomosque' },
] as const;

type ChannelKey = (typeof CHANNELS)[number]['key'];

export async function FollowUs() {
  const t = await getTranslations('followUs');
  const tSocial = await getTranslations('footer.social');

  return (
    <section
      aria-labelledby="follow-us-heading"
      className="border-b border-paper/15 bg-dusk py-12 text-paper md:py-section-md"
    >
      <SectionBody>
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
          {t('eyebrow')}
        </p>
        <h2
          id="follow-us-heading"
          className="mt-3 max-w-2xl font-serif text-section text-balance text-paper sm:mt-4"
        >
          {t.rich('title', { em: (chunks) => <Accent surface="dusk">{chunks}</Accent> })}
        </h2>
        <p className="mt-4 max-w-[42ch] text-pretty text-body text-paper/70">{t('lede')}</p>

        {/* A swipe rail on a phone, three across from sm — the same pattern the
           costed gifts use on /moskeprosjektet, so the two read as one system.
           Cards sit at 78% so the next one peeks in and the row reads as
           swipeable without needing a hint. */}
        <ul className="no-scrollbar -mx-1 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 md:mt-10">
          {CHANNELS.map(({ key, href }) => (
            <li key={key} className="w-[78%] shrink-0 snap-start sm:w-auto sm:shrink">
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col rounded-2xl border border-paper/15 bg-paper/[0.03] p-5 transition-[border-color,background-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/60 hover:bg-paper/[0.06] md:p-6"
              >
                <ChannelMark
                  channel={key}
                  className="h-7 w-7 text-gold transition-colors duration-300 group-hover:text-gold-deep"
                />

                <p className="mt-6 font-serif text-[1.15rem] leading-tight text-paper md:text-[1.25rem]">
                  {tSocial(key)}
                </p>
                <p className="mt-1 break-all font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-paper/45">
                  {t(`channels.${key}.handle`)}
                </p>

                <p className="mt-4 text-[0.9rem] leading-snug text-paper/70">
                  {t(`channels.${key}.blurb`)}
                </p>

                {/* mt-auto so the action sits on one line across all three
                   cards however long the blurb above it runs. */}
                <span className="mt-auto flex items-center gap-2 pt-6 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold">
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

  // TikTok — the note, in one stroke: the round head bottom-left, the stem
  // up through the body, and the flag reaching to the top right.
  return (
    <svg {...common}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}
