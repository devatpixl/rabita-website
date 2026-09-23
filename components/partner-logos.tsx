import fs from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { PARTNERS, type Partner } from '@/lib/partners';
import { cn } from '@/lib/cn';
import { SectionBody } from './primitives';

// The partner strip (client, 2026-09-16, Om oss list: "Legge til
// samarbeidspartnere med logo (med scrollefunksjon)", like the strip on the
// Sherko reference, and "trenger kun Logo ... ikke en tekst under i tillegg").
//
// ── IT ONLY SHOWS WHAT IS ACTUALLY ON DISK ────────────────────────────────
// Twelve were asked for and ten arrived on 2026-09-16; Bydel Gamle Oslo and
// Bydel St. Hanshaugen are still missing. Rather than ship two grey gaps,
// this reads public/partners at render time and keeps only the entries whose
// file exists. The two absent ones are simply not in the strip, and dropping
// their files in is the whole of adding them — no code change, and they land
// in the client's order because the order lives in lib/partners.ts.
//
// fs at render is safe here and deliberate: this is a server component and
// the page is statically rendered, so the check runs at build time, not per
// request. It is also the only way to make the strip self-enabling.
//
// ── TWO ROWS, RUNNING AGAINST EACH OTHER ──────────────────────────────────
// Client, 2026-09-16: "divide the logos in 2 rows", which is what the Sherko
// reference does. Its rows carry `mt-3 first:mt-0` and every other one adds
// `[animation-direction:reverse]`, so the strips travel opposite ways and the
// block reads as a weave instead of one long conveyor. Read off the live site,
// same as the keyframe.
//
// A marquee that loops without a visible jump has to contain its content
// twice and travel exactly half its own width. The second copy is aria-hidden
// so a screen reader is not read ten organisations and then the same ten
// again.
//
// ── THE LOGOS ARE NOT SQUEEZED ────────────────────────────────────────────
// Twelve marks at twelve aspect ratios. They are normalised on HEIGHT with
// width:auto, which is how a logo row stays honest — normalising on width
// would make a wordmark tower over a roundel. object-contain, never cover:
// cropping somebody's logo is worse than leaving air around it.
//
// ── KILLING THE WHITE BOXES WITHOUT TOUCHING THE FILES ────────────────────
// Client, 2026-09-16: "try to keep logos only, not the background colour of
// them". Six of the ten came as artwork on a solid white rectangle, which on
// this warm paper (#FAF8F4) reads as ten white cards rather than ten logos.
//
// mix-blend-mode: multiply, NOT a colour key. Multiply maps white to whatever
// is beneath it and leaves ink alone, so the boxes vanish and the artwork is
// untouched — and crucially it cannot punch holes. Keying white out
// pixel-by-pixel would have gone straight through the middle of Oslo's crest,
// Frivillighet Norge's outlined heart and Sparebankstiftelsen's hollow ring,
// all of which are white on the INSIDE. It is also non-destructive: the files
// on disk are exactly what Rabita supplied.
//
// Safe for all ten because every one is dark or coloured ink on a light
// ground — checked, not assumed. A white-on-dark logo would disappear under
// multiply and would need its own treatment.
//
// ── COLOUR, NOT GREYSCALE ─────────────────────────────────────────────────
// The first pass greyscaled these and revealed them on hover. It looks smart
// and it is the wrong call here: half of them are public bodies — Oslo
// kommune, Kriminalomsorgen, Bufdir — whose marks come with brand rules, and
// recolouring somebody's logo is not ours to do. They run in their own
// colours, held back only by a little opacity.

export async function PartnerLogos({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'aboutPage.partners' });

  const available = PARTNERS.filter((p) => {
    try {
      return fs.existsSync(path.join(process.cwd(), 'public', p.logo));
    } catch {
      return false;
    }
  });

  if (available.length === 0) return null;

  // Split in two, and the halves are DISJOINT — slice(0, half) and
  // slice(half) share no entry, so nothing in the top row appears in the
  // bottom one (client, 2026-09-16: "the ones shown in top row wont be shown
  // in second row").
  const half = Math.ceil(available.length / 2);
  const rows = [available.slice(0, half), available.slice(half)];

  // ── WHY EACH GROUP IS REPEATED, AND WHY ONLY TWICE ──────────────────────
  // A -50% marquee is seamless only while ONE group is at least as wide as
  // the box clipping it; any narrower and the track runs out, leaving a gap
  // before it snaps back. Five logos at ~210px come to ~1050px, so two
  // repeats (~2100px) clear a 1920 desktop with room to spare.
  //
  // It was three, which put fifteen logos in a row and read as a crowd
  // (client: "use less logos with more space"). Two plus the wider padding
  // below is the same guarantee with a third less on screen.
  //
  // The padding is doing double duty: at px-24 an item is ~282px, so a group
  // is ~2820px and still clears a 2560 monitor. At the old px-16 two repeats
  // came to 1955px — enough for the 1920 this was measured on, and a visible
  // gap on anything wider.
  const REPEATS = 2;

  // ── SPEED IS SET IN PIXELS PER SECOND, NOT IN SECONDS ───────────────────
  // Client, 2026-09-16: "now to fast make it slow ... didnt you check in code
  // of sherko". The rule WAS Sherko's — `var(--marquee-duration, 40s)` — and
  // that is exactly the trap: 40s is not a speed, it is a lap time, so the
  // same number runs faster the denser the track. Sherko's group is about
  // 1216px of 19rem cards and crosses it in 40s, roughly 30px/s. Ours was
  // ~2100px of small logos in the same 40s, about 52px/s — near enough double,
  // which is what read as too fast.
  //
  // So the duration is derived instead: a target speed, and the lap time falls
  // out of however wide the row happens to be. Adding a partner now makes the
  // lap longer, not the strip quicker.
  const ITEM_PX = 282; // one logo plus its padding, measured at md
  const SPEED_PX_PER_S = 26; // a shade calmer than the reference's ~30
  const groupPx = half * REPEATS * ITEM_PX;
  const duration = `${Math.round(groupPx / SPEED_PX_PER_S)}s`;

  const logo = (p: Partner, clone: boolean, key: string) => (
    <li
      key={`${key}-${p.logo}`}
      // bg-paper HERE, on the item, not on the wrapper.
      //
      // A mix-blend-mode blends with whatever is painted below it inside its
      // nearest stacking context — and the .marquee track animates
      // `transform`, which creates one. So a background on the wrapper outside
      // that track never reached the logos, and the white boxes survived two
      // attempts at removing them. Painted on the item itself it is
      // unavoidably in the same context, directly beneath the image.
      className="flex shrink-0 items-center bg-paper px-12 md:px-24"
    >
      <Image
        src={p.logo}
        // No printed caption, per the brief — but the name still has to exist
        // for anyone not looking at the screen. Only the first, unrepeated
        // copy carries it; everything after it is decoration.
        alt={clone ? '' : p.name}
        title={clone ? undefined : p.name}
        width={220}
        height={64}
        // EAGER, deliberately. next/image lazy-loads by default, which is
        // wrong for a marquee: the track is thousands of pixels wide inside an
        // overflow-hidden wrapper, so all but the first couple of logos sit
        // outside the viewport and are brought in by the ANIMATION rather than
        // by scrolling. The browser's intersection logic never fires for them
        // and the strip ran empty — measured, 0 of 20 loaded.
        loading="eager"
        className={cn(
          'w-auto opacity-80 mix-blend-multiply transition-opacity duration-300 hover:opacity-100',
          // Height by shape, so the AREA evens out — see Partner.shape.
          // Stepped up ~1.35x on 2026-09-16 ("make them a bit bigger, so
          // easier to see"). The RATIO between the three classes is what had
          // to survive the bump, since that is what keeps the areas even: at
          // md a wide mark lands ~115x36, a mid ~91x48 and a square 64x64 —
          // about 4,100 square points each.
          p.shape === 'wide'
            ? 'h-8 md:h-9'
            : p.shape === 'mid'
              ? 'h-10 md:h-12'
              : 'h-14 md:h-16',
        )}
      />
    </li>
  );

  return (
    <section className="bg-paper py-section-sm">
      <SectionBody>
        <div className="flex items-center gap-4">
          <h2 className="shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
            {t('heading')}
          </h2>
          <span aria-hidden className="h-px flex-1 bg-rule" />
        </div>
      </SectionBody>

      {/* Sherko's own markup, read off sherko.vercel.app: a clipping wrapper
         carrying the edge mask, then one `flex w-max` .marquee track per row,
         each holding two identical `flex shrink-0` groups.

         The paper the logos blend against is NOT here — it is on each item.
         See the note there: this element sits outside the animated track's
         stacking context, so a background here never reaches them. */}
      <div
        className="relative -mx-6 mt-8 overflow-hidden py-2 md:-mx-10"
        style={{
          ['--marquee-duration' as string]: duration,
          maskImage:
            'linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)',
        }}
      >
        {rows.map((items, r) => (
          <ul
            key={r}
            className={cn(
              'marquee mt-3 flex w-max first:mt-0 hover:[animation-play-state:paused]',
              r % 2 === 1 && '[animation-direction:reverse]',
            )}
          >
            {[false, true].map((clone) => (
              <li key={String(clone)} className="contents" aria-hidden={clone || undefined}>
                <ul className="flex shrink-0">
                  {Array.from({ length: REPEATS }).flatMap((_, rep) =>
                    items.map((p) => logo(p, clone, `${r}-${clone}-${rep}`)),
                  )}
                </ul>
              </li>
            ))}
          </ul>
        ))}
      </div>

    </section>
  );
}
