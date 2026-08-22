import { setRequestLocale } from 'next-intl/server';
import { CampaignMeter } from '@/components/campaign-meter';
import { CongregationToday } from '@/components/congregation-today';
import { ImpactStory } from '@/components/impact-story';
import { Hero } from '@/components/hero';
import { Membership } from '@/components/membership';
import { MotionRise } from '@/components/motion-rise';
import { ProjectOverview } from '@/components/project-overview';
import { SadaqaBand } from '@/components/sadaqa-band';
import { ZoomParallax } from '@/components/zoom-parallax';

// Homepage section order — ordering ONLY. Do not restyle in this file.
//
// The pinned building cross-section moved to /moskeprosjektet. It ran 800vh
// on desktop — roughly a third of this page — and it is the deep content the
// dedicated project page is supposed to hold, not the introduction.
//
// Two more sections came out with it:
//   Zoom band ("Seven floors, one address") — a screen and a half of scroll
//     for one sentence, and it describes the building, which now has a page.
//   Community gallery ("We are already a congregation") — three and a half
//     screens making the same argument the Rabita section above it already
//     makes in words. Keeping both said it twice and cost the most scroll
//     of anything left on the page.
//   Prayer + visit ("What's happening today, and how to drop in") — the
//     times, the address and the group-visit form. All of it lives on
//     /bonnetider and /besok-oss, and the nav points straight at both.
//   Events ("What's happening at the mosque") — the next event plus three
//     more, each with its own signup. /arrangementer holds the same list.
//   01 Hero
//   01b Zoom parallax  (bridges hero and Four chapters; ~200vh)
//   02 Four chapters (ImpactStory)
//   03 Congregation today (full-bleed band)
//   05 Campaign meter
//   08 Sadaqa jariya
//   11 Membership (dusk)
//   (Footer lives in the locale layout, not here)
// Six is on dusk to break the run of warm off white through the middle of the page.
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <Hero />
      <ZoomParallax />
      <ImpactStory />
      <MotionRise><CongregationToday /></MotionRise>
      {/* The building before the money. The meter's heading is "Raised for
         the new mosque", and until this section runs the page has never
         said what the new mosque IS — the zoom parallax shows it, wordlessly,
         and nothing names it. The goal is also unreadable without it:
         100 000 000 kr is either enormous or reasonable depending entirely
         on whether you know it buys 6 762 m² and 2 500 prayer places.
         Each section now supplies what the next one needs. */}
      <ProjectOverview />
      <MotionRise><CampaignMeter /></MotionRise>
      {/* Membership before sadaqa. Membership is the lighter ask — 1 000 kr
         a year, or free — and sadaqa jariya is the heaviest thing on the
         page: giving a prayer space in the name of someone who has died.
         Closing on that rather than on an AGM notice is the stronger last
         word, and it puts the two asks in ascending order of weight. */}
      <MotionRise><Membership /></MotionRise>
      <MotionRise><SadaqaBand /></MotionRise>
    </main>
  );
}
