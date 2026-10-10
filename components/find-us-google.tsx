import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/cn';
import { DIRECTIONS_URL, LANDMARKS, ROUTES, VISIT, VISIT_EMBED_QUERY } from '@/lib/location';
import { MyMapsFrame } from './my-maps-frame';

// The apartments map, as a real Google map (client, 2026-09-15: "Real google
// maps / Remove the lines / Just put in the point").
//
// GOOGLE MY MAPS, NOT THE MAPS API, and the reason is billing rather than
// preference. Only two Google products put several custom markers on one map —
// the JavaScript API and Static Maps — and both need a key on a Cloud project
// with billing enabled, i.e. a card, even though a site this size would never
// leave the free tier. The keyless Embed API shows exactly one place, which
// cannot carry his five landmarks. My Maps does all six, free, no key, no
// card, and the client places the pins himself: he can rename or move one in a
// browser and this page follows, with no deploy.
//
// The map is the client's own, made 2026-09-15:
// mid=1IE-Lk2r5dkb-hqk8RV0oV8So1UIsPKg, six placemarks —
// Rabita – Oslo Sentralmoské, Regjeringskvartalet, Stortinget, Oslo S,
// Oslo bussterminal, Operahuset. Oslo City is deliberately absent ("Fjerne
// Oslo City"). No route layer, so nothing draws lines.
//
// ── THE DISTANCES STAY OURS ───────────────────────────────────────────────
// Google will not print "614 m" next to a pin, and his written list asks to
// "vise kun avstand i meter". So the metres sit beside the map instead, read
// from lib/walking-routes.json — REAL pedestrian routes fetched from OSM, not
// straight lines. Losing them to the embed would have been a downgrade
// dressed up as an upgrade.
//
// ── PRIVACY, UNRESOLVED AND FLAGGED ───────────────────────────────────────
// This iframe sends every visitor's IP to Google and lets Google set cookies,
// while the consent banner on this same site says "Nettsiden fungerer uten
// sporing" and offers only essential/measurement. That is a real question for
// a Norwegian site and it is the CLIENT'S to answer — raised 2026-09-15, not
// yet decided. If the answer is "gate it", this component wants a
// click-to-load placeholder in front of the iframe; the markup below is
// deliberately simple so that is easy to add.
//
// referrerPolicy: Google needs the referrer to serve the map, so it is
// no-referrer-when-downgrade rather than no-referrer. loading="lazy" keeps it
// off the critical path — it sits well below the fold.

const MAP_MID = '1IE-Lk2r5dkb-hqk8RV0oV8So1UIsPKg';

/** THE FOOTER'S OWN MY MAP (user, 2026-10-10: the footer map in the same
 *  design as the Leiligheter map, with the footer's location and pin as they
 *  are). One placemark, Sørligata 8a — the address the client requires in
 *  every footer — and nothing else. A SEPARATE map on purpose: MAP_MID above
 *  is the live Leiligheter map, which the client said must not change, and
 *  any edit to a My Map goes live with no deploy. */
const VISIT_MAP_MID = '1mMioQY6DD_zeSaSuG0FciUU3Sw2fkUw';
// ~80 m NORTH of the door. The title-bar crop pulls the iframe up 67px, so
// the iframe's centre sits ~33px above the frame's; centring on the door put
// the pin above the middle. Moving the view north brings the pin down onto
// the frame's centre (z15 ≈ 2.4 m/px here).
const VISIT_CENTRE = `${(VISIT.lat + 0.0007).toFixed(6)},${VISIT.lon}`;
const VISIT_ZOOM = 15;

/** Height of the My Maps title bar, which is cropped away. Measured on the
 *  rendered embed (getBoundingClientRect on the bar, 2026-09-28): 67px, not
 *  the 56 it shipped at. At 56 the bottom 11px of the bar — the "About" link —
 *  showed as a stripe along the top of the map. It is a fixed chrome height,
 *  not a content-dependent one. */
const HEADER_PX = 67;

/** Where the My Maps embed opens. Without ll/z it centres on the map's own
 *  bounds, which put the pins in the right half of the footer frame with
 *  Frognerkilen filling the left. This is the midpoint of the six pins
 *  (Slottet 10.7275 to the bus terminal 10.759; the Opera 59.9075 to Slottet
 *  59.9169) at a zoom where all six labels fit inside a ~520px frame with
 *  room to spare. */
// Latitude sits ~170 m north of the pins' true midpoint (59.9122): the
// Leiligheter frame is 40px shorter than the footer's and at the true
// midpoint it clipped the head of Slottet's pin at the top edge. Both frames
// now hold all six pins with the Opera well clear of the bottom chrome.
const MAP_CENTRE = '59.9137,10.7433';
const MAP_ZOOM = 14;

/** The opening view BELOW sm, where the frame is ~330px. Slottet is 1.8 km
 *  west of the rest and a phone frame at this zoom is ~1.4 km across, so a
 *  view that includes it cannot include the other five properly: on the
 *  laptop centre the five central pins were jammed against the right edge
 *  with the west half of the frame empty (client, 2026-09-28, screenshot of
 *  the map panned to where he wanted it). This is the midpoint of THOSE five
 *  — Regjeringskvartalet 10.7426 to the bus terminal 10.759 — so Slottet sits
 *  one swipe west rather than the whole map being made worse to fit it. Same
 *  zoom: at 13 the labels are unreadable at phone size. */
// Latitude ~80 m north of the five's midpoint: the /leiligheter frame is
// 18rem on phones and at the midpoint it cut the head off Rabita's pin.
const MAP_CENTRE_PHONE = '59.9132,10.7508';

/** The five he listed in September, plus Slottet (Versjon 6, 2026-09-22:
 *  "Legg til Slottet ... i tillegg til de allerede viste"). Rabita itself is
 *  the pin at the centre. The list below renders nearest-first, so his order
 *  here only decides nothing — it is the routed metres that sort it. */
const SHOWN = ['regjeringskvartalet', 'stortinget', 'oslo-s', 'bussterminalen', 'operahuset', 'slottet'] as const;

export async function FindUsGoogle({
  locale,
  /**
   * 'full'  — map, the routed metres, and a directions link (the apartments
   *           page, where a buyer is weighing the location).
   * 'map'   — the map alone (the footer, client 2026-09-15: "dont show the
   *           distance, rather only show the map in footer"). The footer
   *           column already prints the address, opening hours and a
   *           Veibeskrivelse link a few centimetres above, so the list would
   *           have been the second answer to a question already answered.
   */
  variant = 'full',
  /**
   * WHICH ADDRESS THE MAP SHOWS. Client, Tekst (endelig) Sept 2026:
   * "Footer-kartet skal vise Sørligata 8a (der menigheten holder til
   * midlertidig i dag) — IKKE Calmeyers gate 8. Dette gjelder footeren på
   * ALLE sider." And in the same breath, about the other two: "Kartene på
   * selve Moskeprosjektet-siden og Leiligheter-siden skal derimot fortsatt
   * vise Calmeyers gate 8 ... disse to skal IKKE endres."
   *
   * So this is the same split lib/campaign.ts already draws between
   * visitAddress and address: where the congregation IS, against what is
   * being BUILT. A footer is somebody working out how to come on Friday.
   *
   * 'visit'   — Sørligata 8a, a plain Google Maps place embed.
   * 'project' — Calmeyers gate 8, the My Maps with the landmark pins.
   */
  place = 'project',
  className,
}: {
  locale: string;
  variant?: 'full' | 'map';
  place?: 'visit' | 'visit-styled' | 'project';
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: 'footer.findUs' });
  const nf = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : locale === 'en' ? 'en-GB' : 'nb-NO');

  const points = SHOWN.map((key) => {
    const mark = LANDMARKS.find((l) => l.key === key);
    return { key, metres: ROUTES[key].metres, kind: mark?.kind };
  }).sort((a, b) => a.metres - b.metres);

  const mapOnly = variant === 'map';

  return (
    <div
      className={cn(
        'overflow-hidden rounded-3xl bg-dusk',
        mapOnly ? 'p-2.5' : 'p-4 sm:p-5',
        className,
      )}
    >
      {/* THE TITLE BAR IS CROPPED OFF, deliberately (client, 2026-09-15:
         "dont show my name here").
         
         A My Maps embed prints the map's name and its OWNER'S Google account
         name across the top — here, a person's name, on a mosque's public
         website. There is no parameter to suppress it: the embed accepts mid,
         ll, z and ehbc, and nothing else.
         
         So the iframe is HEADER_PX taller than its frame and pulled up by
         exactly that much inside an overflow-hidden box. The bar is scrolled
         out of view and the map still fills the frame.
         
         WHAT IS NOT CROPPED, and must never be: Google's attribution. The
         "Google My Maps" logo and the "Map data ©2026 Google / Terms" line sit
         at the FOOT of the embed and are untouched — removing those would
         breach Google's terms. This hides a My Maps title bar, not an
         attribution.
         
         The cost is the expand-to-fullscreen button, which lived in that bar.
         The map is still pannable and zoomable, and Veibeskrivelse below opens
         the real thing.
         
         The proper fix is for the map to live in a RABITA Google account
         rather than a personal one — then the line would read "Rabita" and
         could stay. Raised with the client. */}
      <div className="relative overflow-hidden rounded-2xl bg-paper-deep">
        <div
          className={cn(
            'overflow-hidden',
            // Shorter than the 26rem it shipped at this morning (client,
            // 2026-09-15: "make this map small"). The WIDTH is untouched at
            // ~626px, deliberately: below about 520 Google's "Keyboard
            // shortcuts" button runs into the scale bar and the second
            // attribution group (measured 2026-09-28: 470 collides, 520 is
            // clean), so height is the only dimension that can give.
            //
            // In the footer it wants ≥520px of iframe for the same reason —
            // the footer grid is sized for that from xl; see footer.tsx.
            mapOnly ? 'h-[15rem] sm:h-[23.5rem]' : 'h-[18rem] sm:h-[21rem]',
          )}
        >
          {place === 'visit' ? (
            // A PLAIN PLACE EMBED, not My Maps. Three of the client's
            // complaints about this box disappear by construction: there is
            // no owner title bar, so no black stripe to crop; it fills its
            // frame at any width, so no empty half; and the single pin is
            // labelled by Google itself, so there are no marker names to go
            // missing. Keyless and stable — ?q=<query>&output=embed is the
            // long-standing form.
            //
            // The query leads with the business name rather than the street
            // so the pin reads "Rabita" — see VISIT_EMBED_QUERY in
            // lib/location.ts for what was verified and what is still
            // best-effort about that.
            //
            // No pull-up: a place embed has no title bar, and cropping one
            // would only hide the top of the map.
            //
            // Unused since 2026-09-28 (the footer went back to the landmark
            // map) but kept: it is the one keyless way to show the visit
            // address, and the client has changed his mind on this box twice.
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(VISIT_EMBED_QUERY)}&hl=${locale === 'ar' ? 'ar' : locale === 'en' ? 'en' : 'no'}&z=15&output=embed`}
              title={t('mapTitle')}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ height: '100%' }}
              className="block w-full border-0"
            />
          ) : place === 'visit-styled' ? (
            // Sørligata on the footer's own My Map, so it carries the same
            // base style as the Leiligheter map. Same title-bar crop as below.
            // One opening view: there is a single pin, centred at any width.
            <MyMapsFrame
              src={`https://www.google.com/maps/d/embed?mid=${VISIT_MAP_MID}&ehbc=2E312F&ll=${VISIT_CENTRE}&z=${VISIT_ZOOM}`}
              phoneSrc={`https://www.google.com/maps/d/embed?mid=${VISIT_MAP_MID}&ehbc=2E312F&ll=${VISIT_CENTRE}&z=${VISIT_ZOOM}`}
              title={t('mapTitle')}
              style={{ marginTop: `-${HEADER_PX}px`, height: `calc(100% + ${HEADER_PX}px)` }}
              className="block w-full border-0"
            />
          ) : (
            // The landmark map. Two opening views, chosen on the client by
            // viewport — see my-maps-frame.tsx for why it is done there. The
            // pull-up is the My Maps title-bar crop and nothing else.
            <MyMapsFrame
              src={`https://www.google.com/maps/d/embed?mid=${MAP_MID}&ehbc=2E312F&ll=${MAP_CENTRE}&z=${MAP_ZOOM}`}
              phoneSrc={`https://www.google.com/maps/d/embed?mid=${MAP_MID}&ehbc=2E312F&ll=${MAP_CENTRE_PHONE}&z=${MAP_ZOOM}`}
              title={t('mapTitle')}
              style={{ marginTop: `-${HEADER_PX}px`, height: `calc(100% + ${HEADER_PX}px)` }}
              className="block w-full border-0"
            />
          )}
        </div>

        {/* NO LABEL PLATE OF OUR OWN — and the reason is worth keeping.
           A dusk card reading "RABITA / Sørligata 8a" was drawn over the
           bottom-left of this map for about an hour on 2026-09-22, on the
           assumption that Google would label the pin with the street and we
           would have to supply the identity ourselves.

           Pointing the query at the real listing (see VISIT_EMBED_QUERY)
           made that wrong: Google renders its OWN place card — the name,
           the address and 4,7 ★ (179) — so the plate became a second card
           saying less, on a map only ~340px wide, sitting over the street
           layout. Removed. If a future change ever drops back to an
           address-only query, the plate is the thing to bring back, because
           then nothing names the place. */}
      </div>

      {!mapOnly && (
      <>
      {/* The metres, beside the map rather than on it. Google prints no
         distances, and these are routed walks rather than straight lines —
         801 m on foot against 615 as the crow flies, for Regjeringskvartalet.
         Sorted nearest first, which is the order a reader wants. */}
      <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 px-1 sm:grid-cols-2">
        {points.map((p) => (
          <li
            key={p.key}
            className="flex items-baseline justify-between gap-3 border-b border-paper/10 pb-2 last:border-b-0"
          >
            <span className="text-[14px] leading-snug text-paper/80">{t(`landmarks.${p.key}`)}</span>
            <span className="shrink-0 font-mono text-[0.75rem] tabular-nums text-gold">
              {nf.format(Math.round(p.metres / 10) * 10)} m
            </span>
          </li>
        ))}
      </ul>

      <a
        href={DIRECTIONS_URL}
        target="_blank"
        rel="noreferrer"
        className="group mt-4 inline-flex min-h-11 items-center gap-2 px-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold transition-colors hover:text-paper"
      >
        {t('directions')}
        <span
          aria-hidden
          className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
        >
          &rarr;
        </span>
      </a>
      </>
      )}
    </div>
  );
}
