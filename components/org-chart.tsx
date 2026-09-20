import fs from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/cn';
import { DepartmentIcon } from './department-icons';
import { DEPARTMENTS, IMAM_LEADERS, LEADERSHIP, LEADERSHIP_BIO } from '@/lib/org-chart';

// The organisation chart as markup rather than as a picture of one.
//
// Client, 2026-09-16: "Gjøre organisasjonskart til en integrert del av
// nettsiden", then — of the first attempt — "i dont like this representation
// of the organisation chart, something way more modern and cooler". Then,
// 2026-09-17, the structure itself: Ledelse with names and photographs,
// Imamer with names and photographs, Avdelinger with neither — department
// names only.
//
// ── WHY THE SPINE AND THE TIER NUMERALS CAME OFF ──────────────────────────
// The previous version hung four tiers off a vertical gold rule with a big
// serif numeral per tier. That scaffolding existed to make twenty-eight
// people in four tiers read as LEVELS rather than as one long staff list, and
// it earned its place at that size. At three groups — six faces and ten
// labels — it is machinery around almost nothing, and the client's note above
// it asks for the opposite: "enklere og ryddigere", simpler and tidier.
// Removed, and the groups now separate on air and a hairline.
//
// ── THREE GROUPS, THREE KINDS OF CARD ─────────────────────────────────────
// The one thing this must not be is the same grid printed three times. The
// groups are different KINDS of thing and are set as such, heaviest first:
//
// 1. LEDELSE — three 4:5 portrait plates. The largest objects on the section,
//    because this is the answer to "who runs Rabita" and the rest of the
//    chart is context for it. Frame, hover and easing are lifted exactly from
//    apartment-units.tsx, which is where this site already photographs things.
//
// 2. IMAMER — circles, at the size components/imams.tsx uses on /bonnetider,
//    with the theological leader carrying the gold ring there too. The circle
//    is ALREADY this site's imam idiom, so the change of shape is continuity
//    rather than variety for its own sake, and it reads as a lighter row
//    under the plates without needing to be told to.
//
// 3. AVDELINGER — no faces to carry, so no cards. A set index: hairlines,
//    numerals, department name. Quiet on purpose; ten boxes holding two words
//    each would be the busiest block on the page for the least information.
//
// ── IT WORKS WITH NO PHOTOGRAPHS AT ALL ───────────────────────────────────
// Client, 2026-09-17: "i can get photos if i find any" — so portraits are a
// maybe, and the page has to be finished without them. Rabita has files for
// the three imams and none for the three leaders.
//
// A missing photograph is therefore NOT an empty frame. It renders as a
// monogram plate: the initials set large in the serif on the warm paper, with
// the same ring and radius the photograph would have had. That is a deliberate
// object rather than a hole — which matters at 4:5, where three grey
// rectangles would wreck the block that is meant to anchor the section. When
// a file appears at the path in lib/org-chart.ts it simply fills the frame.
//
// fs at render is safe and deliberate here: server component, statically
// rendered, so the check runs at build time and not per request. Same pattern
// as components/partner-logos.tsx.

/** True when the file is actually on disk under /public. */
function hasPhoto(publicPath: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), 'public', publicPath.replace(/^\//, '')));
  } catch {
    return false;
  }
}

/** "Hossam Belkilani" → "HB", "Yasmin" → "Y". First and last word only, so a
 *  three-part name does not produce three letters and break the plate. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** Gold label, hairline, count. The one thing all three groups share. */
function GroupHead({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-4">
      <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">{label}</h3>
      <span aria-hidden className="h-px flex-1 bg-sage-line" />
      <span className="font-mono text-[0.6875rem] tabular-nums text-ink-40">{String(count).padStart(2, '0')}</span>
    </div>
  );
}

export async function OrgChart({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'aboutPage.org' });
  // Single source for the imam biographies — see the note at the render.
  const tim = await getTranslations({ locale, namespace: 'imams' });
  // chair and vice were already translated for the board section that used to
  // sit on this page, so two of the six titles cost nothing new.
  const tb = await getTranslations({ locale, namespace: 'aboutPage.board.roles' });

  return (
    <div className="mt-10 md:mt-14">
      {/* ── 1. LEDELSE ──────────────────────────────────────────────────── */}
      <section>
        <GroupHead label={t('tiers.leadership')} count={LEADERSHIP.length} />

        <ul className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-7">
          {LEADERSHIP.map((p) => (
            // Horizontal on a phone, stacked from sm. Three full-width 4:5
            // plates one under the other is around 1500px of scrolling for
            // three names and no other information — so on a phone the plate
            // shrinks to a 112px thumbnail with the role and name beside it,
            // which is the same shape the imams take at that width. One
            // section, one behaviour.
            <li key={p.name} className="group flex items-center gap-5 sm:block">
              <div
                className={cn(
                  'relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-2xl transition-[box-shadow] duration-300 ease-out sm:w-full',
                  hasPhoto(p.photo)
                    ? 'bg-paper ring-1 ring-sage-line group-hover:ring-gold-deep/45'
                    : 'bg-dusk ring-1 ring-inset ring-paper/10 group-hover:ring-gold/45',
                )}
              >
                {hasPhoto(p.photo) ? (
                  <Image
                    src={p.photo}
                    alt={p.name}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.04]"
                  />
                ) : (
                  // The monogram plate, on DUSK rather than on paper.
                  //
                  // It was a pale wash first and that was the wrong call: at
                  // 4:5 and three across, a near-white frame with initials
                  // floating in it reads as a photograph that failed to load,
                  // and — worse — it made the group with no pictures the
                  // loudest thing on the section while the imams, who DO have
                  // portraits, sat quietly underneath. The hierarchy was
                  // upside down.
                  //
                  // Dusk fixes both. A dark plate is unmistakably a made
                  // object rather than a hole, gold on #16242E is the site's
                  // own pairing, and the weight now sits where the content is.
                  // It also survives the mixed case — if the client finds one
                  // portrait and not three, a photograph beside a dark plate
                  // still reads as one row, which a photograph beside a white
                  // rectangle does not.
                  <span aria-hidden className="absolute inset-0 grid place-items-center bg-dusk">
                    <span className="flex flex-col items-center gap-2.5 sm:gap-4">
                      <span className="font-serif text-[1.5rem] leading-none tracking-[0.08em] text-gold-soft/75 sm:text-[clamp(2rem,4vw,3rem)]">
                        {initials(p.name)}
                      </span>
                      {/* The same 32px gold hairline apartment-units.tsx sets
                          under its captions. It is what turns the initials
                          into a plate instead of a letterform in space. */}
                      <span className="h-px w-5 bg-gold-soft/45 sm:w-8" />
                    </span>
                  </span>
                )}
              </div>

              <div className="min-w-0 sm:mt-4">
                <p className="font-mono text-[0.625rem] uppercase leading-snug tracking-[0.16em] text-ink-40">
                  {p.boardRole ? tb(p.role) : t(`roles.${p.role}`)}
                </p>
              {/* The name is NOT translated and never should be: these are
                  people, not labels. It stays in Latin script in the Arabic
                  build too, so <bdi> isolates it from the surrounding RTL run
                  — without it a two-part name can have its parts reordered. */}
                <p className="mt-1.5 font-serif text-[1.35rem] leading-snug text-ink">
                  <bdi>{p.name}</bdi>
                </p>
                {/* "navn, bilde og kort beskrivelse for hver" (client, Sept
                   2026). Keyed by NAME rather than by role — see
                   LEADERSHIP_BIO — so that a change of title cannot quietly
                   hand one person another person's biography. */}
                {LEADERSHIP_BIO[p.name] && (
                  <p className="mt-3 text-[14px] leading-relaxed text-ink-60">
                    {t(`bios.${LEADERSHIP_BIO[p.name]}`)}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 2. IMAMER ───────────────────────────────────────────────────── */}
      <section className="mt-14 md:mt-20">
        <GroupHead label={t('tiers.imams')} count={IMAM_LEADERS.length} />

        <ul className="mt-7 grid grid-cols-1 gap-7 sm:grid-cols-3">
          {IMAM_LEADERS.map((im, i) => {
            // The theological leader first and ringed in gold, exactly as
            // components/imams.tsx marks him on /bonnetider.
            const lead = i === 0;
            const src = im.photo;
            return (
              // Centred in the cell from sm (client, 2026-09-18: "make these
              // imams also in centre, see the above 3 are in centre").
              //
              // The leadership plates fill their whole grid cell, so they read
              // as centred in their column whatever their type does. A 112px
              // circle parked at the start of a cell three times that wide
              // does not — it leaves a long gap to its right and the row sits
              // off to one side of a group that is supposed to balance the one
              // above it. Centring the circle AND its type is what makes the
              // two rows read as the same object at two sizes.
              <li key={im.key} className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-0 sm:text-center">
                <span
                  className={cn(
                    // Bigger from md UP ONLY (client, 2026-09-18: "let it remain as it
                    // is on phones and small tabs, but on mac 12-14 inches make
                    // the imams photos a bit bigger"). 80 on a phone and 112 on a
                    // small tablet are untouched; a 13" MacBook is ~1470px wide, so
                    // it takes the lg step.
                    //
                    // 160 is the ceiling, not a taste call: the source files are
                    // 400x400, and a 160px circle on a retina screen asks for 320.
                    // Anything larger starts upscaling.
                    'relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-paper ring-offset-[3px] ring-offset-sage sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-40 lg:w-40',
                    lead ? 'ring-2 ring-gold-deep' : 'ring-1 ring-sage-line',
                  )}
                >
                  {src && hasPhoto(src) ? (
                    <Image src={src} alt={im.name} fill sizes="(min-width: 1024px) 160px, (min-width: 768px) 128px, (min-width: 640px) 112px, 80px" className="object-cover" />
                  ) : (
                    <span aria-hidden className="font-serif text-[1.5rem] text-gold-deep/35 md:text-[1.75rem] lg:text-[2.125rem]">
                      {initials(im.name)}
                    </span>
                  )}
                </span>

                <div className="min-w-0 sm:mt-5">
                  <p className="font-mono text-[0.625rem] uppercase leading-snug tracking-[0.16em] text-ink-40">
                    {t(`roles.${im.role}`)}
                  </p>
                  {/* The honorific rides with the name here too, so the two
                     places the site lists these three men agree. Inside the
                     <bdi>: the title belongs to the name and an RTL run must
                     not be allowed to separate them. */}
                  <p className="mt-1.5 font-serif text-[1.35rem] leading-snug text-ink">
                    <bdi>
                      <span className="text-ink-60">{im.title}</span> {im.name}
                    </bdi>
                  </p>
                  {/* "navn, bilde og kort beskrivelse for hver" — the imams
                     get one too (client, Sept 2026). Read from
                     imams.people.<key>.bio, which is the SAME string
                     /bonnetider sets: his document prints the identical
                     biography in both places, and one source means the two
                     pages cannot drift. The link below still goes to
                     /bonnetider, where they sit with the languages each man
                     takes a conversation in. */}
                  <p className="mt-3 text-[14px] leading-relaxed text-ink-60">
                    {tim(`people.${im.key}.bio`)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* The biographies and the languages each imam takes a conversation in
            are on /bonnetider, set properly and in full. Repeating them here
            would be the same content twice on one site; a line of type sends
            anyone who wants them to the one place they live. */}
        <Link
          href={`/${locale}/bonnetider#imamene`}
          className="group mt-8 inline-flex items-center gap-2 border-b border-gold-deep/40 pb-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold-deep transition-colors hover:border-gold-deep"
        >
          {t('imamsLink')}
          {/* rtl:rotate-180, as every other arrow on this site does: forward
              in Arabic points left, and an arrow that keeps pointing right is
              pointing back the way the reader came. */}
          <span
            aria-hidden
            className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
          >
            →
          </span>
        </Link>
      </section>

      {/* ── 3. AVDELINGER ───────────────────────────────────────────────── */}
      <section className="mt-14 md:mt-20">
        <GroupHead label={t('tiers.departments')} count={DEPARTMENTS.length} />

        {/* ── THE DEPARTMENTS AS CARDS ──────────────────────────────────
           Client reference, 2026-09-18: two columns of five, each department
           a card with a numeral, a round chip and its name.

           WHAT IS TAKEN FROM IT: the card, the hairline, the round chip, the
           numeral beside it, and the two columns flowing DOWN — 01-05 on the
           left and 06-10 on the right, which is how an index is read. Row-
           major flow makes the numerals jump 01, 03, 05 down the left-hand
           side and looks like items are missing.

           ── THE GLYPHS ────────────────────────────────────────────────
           One per department, drawn in components/department-icons.tsx in the
           same 24x24 / stroke-1.5 language as figure-icons.tsx, so a
           department chip and a visit-card chip read as one system.

           The first build of this section put the NUMERAL in the chip instead
           and argued that inventing iconography had been rejected here before
           — the service pages once carried a big invented line-drawing each
           and the verdict was "looks fake". That was the wrong precedent and
           the client said so: "so basic and bland, no taste". It IS the wrong
           precedent. What failed there was an illustration standing in for a
           photograph; these are small conventional UI glyphs, which are not
           invented at all.

           ── AND NO ARROWS ──────────────────────────────────────────────
           The reference puts one on every card. An arrow is a promise that
           something is on the other side of it, and a department has no page
           here — the client's own instruction for this group is "kun
           avdelingsnavn", names only. Ten arrows pointing at nothing is the
           same fault we just took off the visit cards. */}
        <ol className="mt-7 grid grid-cols-1 gap-3 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-5 sm:gap-x-5">
          {DEPARTMENTS.map((key, i) => (
            <li
              key={key}
              className="group flex items-center gap-3.5 rounded-2xl bg-paper px-4 py-3.5 ring-1 ring-sage-line transition-colors duration-300 hover:ring-gold-deep/45 sm:px-5 sm:py-4"
            >
              {/* Numeral, glyph, name — the reference's own order. The
                 numeral sits OUTSIDE the chip now that the chip has a glyph
                 in it; it is the quietest thing on the card and only has to
                 index the list. */}
              <span
                aria-hidden
                className="w-5 shrink-0 font-mono text-[0.6875rem] tabular-nums text-ink-40"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                aria-hidden
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage-soft text-ink-60 ring-1 ring-sage-line transition-colors duration-300 group-hover:bg-gold-soft/50 group-hover:text-gold-deep group-hover:ring-gold-deep/25"
              >
                <DepartmentIcon name={key} className="h-5 w-5" />
              </span>
              {/* "KUN avdelingsnavn + 1–2 setninger, uten navn/bilde"
                 (client, Sept 2026). The name alone was all this card
                 carried; his sentence says what the department actually
                 does, which is the point of listing it. */}
              <span className="min-w-0">
                <span className="block font-serif text-[1.0625rem] leading-snug text-ink">
                  {t(`roles.${key}`)}
                </span>
                <span className="mt-1.5 block text-[13.5px] leading-relaxed text-ink-60">
                  {t(`departments.${key}`)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
