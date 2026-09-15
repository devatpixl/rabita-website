import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Accent } from './accent';
import { FigureIcon } from './figure-icons';

// "Kjenner du deg igjen?" — the recognition band under the join form
// (client, 2026-09-16, pointing at iman.no: "a section like this also maybe
// in bli-medlem, very modern and premium").
//
// ── WHAT IS BORROWED, AND WHAT IS NOT ─────────────────────────────────────
// Borrowed, because it is genuinely good and this site had nothing like it:
// the SHAPE. Photographs down one side, and on the other a list of
// statements the reader recognises themselves in, closed by the line that
// answers all of them. It catches the reader who scrolled past the form
// because they had not yet decided they were the kind of person it is for.
//
// NOT borrowed: the surface. iman.no rings every photograph in a thick gold
// rounded frame, floats cut-out figures over the band and sets the type in
// heavy condensed caps. SPEC §1 rules all three out — "Geometry as texture,
// never as a border… A decorative frame around every section is the standard
// mosque-website failure."
//
// ── THE GROUND, WHICH TOOK THREE GOES ─────────────────────────────────────
// 1. DUSK, full bleed. It ran straight into the footer, which is also dusk:
//    no seam, one dark mass ~1200px tall, no way to see where the section
//    ended (client: "hard to tell what the difference is between footer and
//    this section").
// 2. DUSK, as an inset rounded panel on paper. The gutter did separate them,
//    and it was worse: a dark slab floating on a page that floats nothing
//    else (client: "this looks cheap").
// 3. SAGE, full bleed — where it should have started, because the site had
//    already solved this. follow-us.tsx: "Sage ground, not dusk (client,
//    2026-09-04): on dusk this section read as part of the footer below it —
//    one undifferentiated dark mass. It now sits on the same pale green the
//    'Dette er Rabita' section owns, which separates it from the footer at a
//    glance and bookends the page in the same colour."
//
// So: the same pale green, full width. The boundary with the footer is now
// light-against-dark — the most legible seam there is, and one that needs no
// gutter, no corner radius and no shadow to state it.
//
// ── THE MARK IN THE GROUND ────────────────────────────────────────────────
// The client asked for the Rabita rosette behind it "in dusk". globals.css
// has .star-texture (gold at 1.5%, for dark grounds) and
// .star-texture--light (gold at 3.5%), but neither is a DUSK mark — both
// tile the gold PNG. So this paints it here: the logo as a MASK with dusk
// behind it, which recolours the artwork properly rather than filtering a
// gold image toward grey.
//
// Inline rather than a new globals.css class on purpose — that file is open
// in another session right now, and a fourth .star-texture variant is not
// worth the merge.
const MARK = '/logo/rabita-mark-256.png';

// Chosen to carry the four statements rather than to decorate: someone being
// welcomed in, children learning, and the congregation at one table. All
// three are real photographs of this congregation, and all three are
// natively the shape the slot wants — no crop is doing heavy lifting.
//   welcome-embrace  888x1500  (0.59, tall)   the belonging
//   quran-carpet    1500x1125  (1.33)         the children
//   iftar-tables    1500x1002  (1.50)         the table
const TALL = '/photos/community/welcome-embrace.webp';
const STACK = [
  { src: '/photos/community/quran-carpet.webp', ratio: 'aspect-[4/3]' },
  { src: '/photos/community/iftar-tables.webp', ratio: 'aspect-[3/2]' },
] as const;

// The four, rewritten 2026-09-16. They read prays / children / project /
// say before that, and every one of them was administrative — "you are not
// on any list", "you have not given yet", "a say in what the floors are used
// for". That asks the reader to become a RECORD. The client was right to
// stop it: "content here shouldnt be asking that just become a member to get
// noticed, but to become better human maybe? small points like this like it
// was in iman.no".
//
// iman.no's four are about the reader's own life — quality time with Allah,
// a safe environment for the family, a community that strengthens their
// iman, a mosque that makes room for their spiritual development — and they
// are QUESTIONS, which is what makes them land as recognition rather than as
// a sales list. These are the same four needs in Rabita's plainer voice:
// quiet, children, community, learning.
//
// The headline moved with them. "Står du oppført?" / "Are you counted?" was
// the administrative framing in one line; it is now "Et sted å be. Og et
// sted å vokse." — the offer rather than the paperwork.
const POINTS = ['quiet', 'children', 'community', 'learn'] as const;

export async function MembershipRecognition({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'joinPage.recognition' });

  return (
    <section className="relative isolate overflow-hidden bg-sage py-14 text-ink md:py-20">
      {/* The rosette, in dusk, tiled. mask + backgroundColor rather than a
         background-image, because the source PNG is gold and the client
         asked for dusk: masking paints #16242E through the artwork's own
         alpha, so the mark keeps its shape and takes the colour exactly.
         320px tile, matching .star-texture--light — large enough to read as
         texture rather than as a repeat. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          WebkitMaskImage: `url('${MARK}')`,
          maskImage: `url('${MARK}')`,
          WebkitMaskRepeat: 'repeat',
          maskRepeat: 'repeat',
          WebkitMaskSize: '320px 320px',
          maskSize: '320px 320px',
          backgroundColor: '#16242E',
          opacity: 0.07,
        }}
      />
      {/* The fade. The texture is at full strength on the photograph side and
         dissolves across to the type, so the rosettes read as a ground the
         section emerges from rather than as wallpaper behind the words — and
         the four statements sit on clean sage, where they are easiest to
         read. A gradient of the ground's OWN colour, not a black scrim: it
         removes the mark without touching anything else. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(100deg, rgba(227,234,228,0) 0%, rgba(227,234,228,0.15) 32%, rgba(227,234,228,0.72) 62%, rgba(227,234,228,0.96) 88%)',
        }}
      />
      {/* NO top fade, deliberately. One shipped here — paper dissolving into
         sage over 128px — and it made the band read as washed-out cream
         rather than as the site's green (client, 2026-09-16: "use the green
         where mostly used in bg of our website so theme looks same").
         #E3EAE4 was right all along; the gradient on top of it was not.
         Every other sage section on this site — the follow band, the About
         story, the project facts — is a SOLID block of it, edge to edge, and
         that is what makes them read as one theme. This is now the same. */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ── the photographs ───────────────────────────────────────────
             order-last below lg: on a phone the argument is what earns the
             scroll, and three photographs ahead of it would push the first
             sentence off the screen. */}
          <div className="order-last lg:order-none lg:col-span-5">
            {/* items-stretch, and the tall photograph takes h-full rather
               than an aspect ratio. The right column therefore SETS the
               height and the left one matches it exactly, whatever the
               stagger and the gaps come to — an earlier version gave the left
               column a 4:5 ratio and it finished 100px short, so the group
               sat in the middle of the band looking unfinished. Nothing here
               is measured by hand; it balances itself at every width. */}
            <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-4">
              <Frame src={TALL} alt={t('alt.0')} className="h-full min-h-[15rem]" />
              {/* The stagger. mt on the second column only, so the two never
                 line up across the middle — the one move that makes three
                 photographs read as composed rather than as a contact
                 sheet. */}
              <div className="mt-8 flex flex-col gap-3 sm:mt-12 sm:gap-4">
                {STACK.map((sh, i) => (
                  <Frame key={sh.src} src={sh.src} alt={t(`alt.${i + 1}`)} className={sh.ratio} />
                ))}
              </div>
            </div>
          </div>

          {/* ── the argument ──────────────────────────────────────────── */}
          <div className="lg:col-span-7">
            <p className="flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
              <span aria-hidden className="h-px w-6 shrink-0 bg-gold-deep/50" />
              {t('eyebrow')}
            </p>

            <h2 className="mt-5 max-w-[20ch] font-serif text-section leading-[1.12] text-balance text-ink">
              {t.rich('headline', {
                em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
              })}
            </h2>

            <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-ink-60">
              {t('lede')}
            </p>

            {/* The four. Ruled rather than bulleted, because a rule is the
               site's own way of listing and a bullet is nobody's. */}
            <ul className="mt-8 border-t border-ink/12">
              {POINTS.map((k) => (
                <li key={k} className="flex items-start gap-4 border-b border-ink/12 py-4">
                  <span
                    aria-hidden
                    className="mt-px grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold-deep/12 text-gold-deep ring-1 ring-gold-deep/25"
                  >
                    <FigureIcon name="check" className="h-[15px] w-[15px]" />
                  </span>
                  <span className="text-[15px] leading-snug text-ink">{t(`points.${k}`)}</span>
                </li>
              ))}
            </ul>

            <p className="mt-8 max-w-[38ch] font-serif text-[clamp(1.25rem,2vw,1.5rem)] leading-[1.25] text-balance text-ink">
              {t.rich('closing', {
                em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
              })}
            </p>

            {/* Back up to the form, which is the only thing this section is
               for. A plain anchor rather than the scrollTo helper: it needs
               no JavaScript, it survives hydration failing, and it is one
               screen away rather than ten. */}
            <a
              href="#meld-inn"
              className="group mt-7 inline-flex min-h-12 items-center gap-2.5 rounded-full bg-gold-deep px-6 text-[14px] font-semibold text-paper transition-colors hover:bg-ink"
            >
              {t('cta')}
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              >
                &rarr;
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// One photograph. rounded-2xl and an ink hairline — the hairline is what
// separates a photograph from the ground, and it is a rule rather than a
// frame, which is the distinction SPEC §1 draws.
function Frame({ src, alt, className }: { src: string; alt: string; className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ring-1 ring-ink/10 ${className}`}>
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 20vw, 45vw" className="object-cover" />
    </div>
  );
}
