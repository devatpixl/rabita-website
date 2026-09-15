import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/cn';
import { ORG_CHART } from '@/lib/org-chart';

// The organisation chart as markup rather than as a picture of one.
//
// Client, 2026-09-16: "Gjøre organisasjonskart til en integrert del av
// nettsiden", then — of the first attempt — "i dont like this representation
// of the organisation chart, something way more modern and cooler".
//
// ── WHAT THE FIRST VERSION GOT WRONG ──────────────────────────────────────
// It was four columns of role-over-name separated by hairlines: correct,
// readable, and indistinguishable from a staff directory in a PDF. Twenty-
// eight rows of the same two lines of type, with nothing to tell you that the
// Kontrollutvalg sits above the Styre, or that the Avdelinger are ten
// parallel things rather than a long list. The information was all there and
// the STRUCTURE was invisible.
//
// ── WHAT THIS DOES INSTEAD ────────────────────────────────────────────────
// Three devices, none of them decoration:
//
// 1. A SPINE. Each tier hangs off a vertical gold rule running down the start
//    edge, with a filled node where the tier begins. That single line is what
//    makes four groups read as four LEVELS — it is the one thing a chart has
//    that a list does not, and it costs one border.
//
// 2. A MONOGRAM per person. There are no portrait files — the client's image
//    holds all 28 faces at ~51px, too small to crop and reuse honestly — so
//    each card carries initials instead. It gives the grid a rhythm of marks
//    to scan rather than an unbroken field of text, and unlike a photograph
//    it cannot be wrong.
//
// 3. A TIER NUMERAL, big and serif, in the site's own counting idiom (the
//    gift ladder, the service grid, the floors). It puts the levels in order
//    without drawing a single connector line — which is what would collapse
//    on a phone anyway.
//
// Cards, not rows: a card is a person. Hover lifts the ring to gold, which is
// the same affordance apartment-units.tsx uses on its photographs.
//
// ── THIS EXPECTS THE SAGE GROUND ──────────────────────────────────────────
// The section around it is bg-sage (client, 2026-09-16). Everything
// structural is therefore on the green family — border-sage-line for the
// spine and the tier rules, ring-sage on the node's halo so it reads as a
// bead ON the line rather than a dot with a warm corona — while the cards go
// the other way, to warm bg-paper. That contrast is the same one /om-oss
// already uses for the visit form: a paper card on a tinted ground.
//
// Swap the section back to paper and these four tokens have to come back to
// rule / paper / paper-2, or the chart loses its structure into the ground.

/** "Hossam Belkilani" → "HB", "Yasmin" → "Y". First and last word only, so a
 *  three-part name does not produce three letters and break the circle. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

export async function OrgChart({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'aboutPage.org' });
  // chair / vice / member were already translated for the board section, so
  // three of the twenty-two roles cost nothing new.
  const tb = await getTranslations({ locale, namespace: 'aboutPage.board.roles' });

  return (
    <div className="mt-10 md:mt-14">
      {ORG_CHART.map((tier, ti) => (
        <section
          key={tier.key}
          className={cn(
            // The spine. border-s so Arabic gets it on the right; the last
            // tier stops the line rather than letting it run into nothing.
            'relative ps-6 md:ps-10',
            ti === ORG_CHART.length - 1 ? 'border-s border-transparent' : 'border-s border-sage-line',
          )}
        >
          {/* The node where this level begins, sitting ON the spine. */}
          <span
            aria-hidden
            className="absolute -start-[4.5px] top-2 h-[9px] w-[9px] rounded-full bg-gold-deep ring-4 ring-sage"
          />

          <div className="flex items-baseline gap-4">
            <span
              aria-hidden
              className="font-serif text-[1.75rem] leading-none tabular-nums text-gold-deep/35 md:text-[2.25rem]"
            >
              {String(ti + 1).padStart(2, '0')}
            </span>
            <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
              {t(`tiers.${tier.key}`)}
            </h3>
            <span aria-hidden className="h-px flex-1 bg-sage-line" />
            <span className="font-mono text-[0.6875rem] tabular-nums text-ink-40">
              {String(tier.people.length).padStart(2, '0')}
            </span>
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tier.people.map((p, i) => (
              // The key carries the index: several people hold more than one
              // post — Kamel Amara is both Teologisk leder and
              // Byggeprosjektet, Nour Kanout sits on the board and runs IT —
              // so name alone is not unique, even within a tier.
              <li key={`${p.name}-${i}`}>
                <div className="group flex h-full items-center gap-4 rounded-2xl bg-paper p-4 ring-1 ring-sage-line transition-colors duration-300 hover:ring-gold-deep/45">
                  <span
                    aria-hidden
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-soft/45 font-mono text-[0.8125rem] tracking-[0.04em] text-gold-deep ring-1 ring-gold-deep/20 transition-colors duration-300 group-hover:bg-gold-deep group-hover:text-paper group-hover:ring-gold-deep"
                  >
                    {initials(p.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[0.625rem] uppercase leading-snug tracking-[0.16em] text-ink-40">
                      {p.boardRole ? tb(p.role) : t(`roles.${p.role}`)}
                    </span>
                    {/* The name is NOT translated and never should be: these
                        are people, not labels. It stays in Latin script in the
                        Arabic build too, so <bdi> isolates it from the
                        surrounding RTL run — without it a two-part name can
                        have its parts reordered on the page. */}
                    <span className="mt-1 block font-serif text-[1.0625rem] leading-snug text-ink">
                      <bdi>{p.name}</bdi>
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {/* Space below, inside the bordered box, so the spine runs between
              the tiers instead of stopping at the last card. */}
          <div aria-hidden className={ti === ORG_CHART.length - 1 ? '' : 'h-10 md:h-14'} />
        </section>
      ))}
    </div>
  );
}
