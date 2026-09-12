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
// The marks stay drawn in the site's own line language (1.5 stroke, round
// caps) rather than swapped for real brand logos, but they now carry each
// platform's colour (client, Versjon 3: "prove a endre de ulike plattformene,
// til de ulike fargene").
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

const CHANNELS = [
  { key: 'instagram', href: 'https://instagram.com/detislamskeforbundet/' },
  { key: 'facebook', href: 'https://facebook.com/detislamskeforbundet/' },
  { key: 'tiktok', href: 'https://tiktok.com/@oslomosque' },
  { key: 'whatsapp', href: `https://wa.me/${CAMPAIGN.contactPhone.replace(/[^\d]/g, '')}` },
] as const;

type ChannelKey = (typeof CHANNELS)[number]['key'];

// The tint under and around each logo — the seal fill, its ring and the
// card's hover edge. NOT the logo itself, which carries its own colours
// inside ChannelMark and is never recoloured from out here.
//
// Unprefixed RGB triplets so the alphas below can be written inline as
// rgb(... / a) rather than parsed out of a hex at render time.
//
// Instagram takes the magenta stop from the middle of its gradient: a
// gradient tint under a gradient logo muddies both, and the magenta is the
// stop that reads as "Instagram" on its own. TikTok takes its red rather
// than the black of its glyph, for the same reason the black works on the
// glyph and would not work here — a near-black seal would read as a hole
// in the card.
const CHANNEL_RGB: Record<ChannelKey, string> = {
  instagram: '221 42 123',
  facebook: '24 119 242',
  tiktok: '254 44 85',
  whatsapp: '37 211 102',
};

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

// The real brand marks, in the real brand colours (client, 2026-09-12:
// "simply use the realest logos, so no bullshit, real logo of each platform,
// exact same colour").
//
// This replaces marks hand-drawn in the site's own line language, and with
// them the argument for drawing them: that four outside colours would be the
// loudest thing on the page. They are not, because the colour is confined to
// a 24px glyph and a ghost at 7% -- and a logo a visitor half-recognises is
// worth less than one they spot instantly, which is the entire job of this
// section.
//
// Glyphs from Simple Icons 13.21.0 (CC0-1.0, public domain), which takes them
// from each brand's own asset kit, fetched rather than retyped so the path
// data is exact. All four are single-path 24x24, the viewBox the old marks
// already used, so nothing about the layout had to move.
//
// Two of the four are not one flat colour, and both are drawn the way the
// brand actually draws them:
//
//   INSTAGRAM is a gradient, not a pink. Five stops running bottom-left to
//   top-right: yellow, orange, magenta, purple, blue. The gradient needs an
//   id, and each card paints this mark twice (the seal and the ghost), so the
//   id carries an instance suffix -- one shared id across eight renders would
//   be duplicate ids in the document.
//
//   TIKTOK is black with a cyan and a magenta offset behind it. Drawn as the
//   real one is: the same path three times, cyan up-left, magenta down-right,
//   black on top. The trio is scaled to 0.92 about the centre first, because
//   the glyph already fills the full 24 units and the offsets would otherwise
//   push the note past the viewBox and clip its curve.
const INSTAGRAM_GRADIENT = [
  { offset: '0%', color: '#FEDA77' },
  { offset: '25%', color: '#F58529' },
  { offset: '50%', color: '#DD2A7B' },
  { offset: '75%', color: '#8134AF' },
  { offset: '100%', color: '#515BD4' },
];

const TIKTOK_PATH =
  'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z';

function ChannelMark({
  channel,
  instance,
  className,
}: {
  channel: ChannelKey;
  /** Distinguishes this render from the other one on the same card, so the
   *  Instagram gradient gets a document-unique id. */
  instance: string;
  className?: string;
}) {
  const common = { viewBox: '0 0 24 24', className, 'aria-hidden': true as const };

  if (channel === 'instagram') {
    const id = `ig-gradient-${instance}`;
    return (
      <svg {...common}>
        <defs>
          <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
            {INSTAGRAM_GRADIENT.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>
        <path
          fill={`url(#${id})`}
          d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"
        />
      </svg>
    );
  }

  if (channel === 'facebook') {
    return (
      <svg {...common}>
        <path
          fill="#1877F2"
          d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"
        />
      </svg>
    );
  }

  if (channel === 'tiktok') {
    return (
      <svg {...common}>
        <g transform="translate(12 12) scale(0.92) translate(-12 -12)">
          <path fill="#25F4EE" transform="translate(-0.9 -0.9)" d={TIKTOK_PATH} />
          <path fill="#FE2C55" transform="translate(0.9 0.9)" d={TIKTOK_PATH} />
          <path fill="#000000" d={TIKTOK_PATH} />
        </g>
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path
        fill="#25D366"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
      />
    </svg>
  );
}
