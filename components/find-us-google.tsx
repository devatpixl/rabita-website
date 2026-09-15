import { getTranslations } from 'next-intl/server';
import { DIRECTIONS_URL, LANDMARKS, ROUTES } from '@/lib/location';

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

/** The five he listed, in his order. Rabita itself is the sixth pin. */
const SHOWN = ['regjeringskvartalet', 'stortinget', 'oslo-s', 'bussterminalen', 'operahuset'] as const;

export async function FindUsGoogle({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'footer.findUs' });
  const nf = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : locale === 'en' ? 'en-GB' : 'nb-NO');

  const points = SHOWN.map((key) => {
    const mark = LANDMARKS.find((l) => l.key === key);
    return { key, metres: ROUTES[key].metres, kind: mark?.kind };
  }).sort((a, b) => a.metres - b.metres);

  return (
    <div className="overflow-hidden rounded-3xl bg-dusk p-4 sm:p-5">
      <div className="overflow-hidden rounded-2xl bg-paper-deep">
        <iframe
          src={`https://www.google.com/maps/d/embed?mid=${MAP_MID}&ehbc=2E312F`}
          title={t('mapTitle')}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-[22rem] w-full border-0 sm:h-[26rem]"
        />
      </div>

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
    </div>
  );
}
