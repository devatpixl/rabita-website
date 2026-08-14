import { setRequestLocale } from 'next-intl/server';
import { BuildingRises } from '@/components/building-rises';
import { CampaignMeter } from '@/components/campaign-meter';
import { CongregationToday } from '@/components/congregation-today';
import { ImpactStory } from '@/components/impact-story';
import { GiftLadder } from '@/components/gift-ladder';
import { Hero } from '@/components/hero';
import { Membership } from '@/components/membership';
import { MotionRise } from '@/components/motion-rise';
import { EventsSchedule } from '@/components/events-schedule';
import { PrayerVisit } from '@/components/prayer-visit';
import { TrustBand } from '@/components/trust-band';
import { WhereMoneyGoes } from '@/components/where-money-goes';
import { ZoomParallax } from '@/components/zoom-parallax';

// Homepage section order — ordering ONLY. Do not restyle in this file.
//   01 Hero
//   01b Zoom parallax  (bridges hero and Four chapters; ~200vh)
//   02 Four chapters (ImpactStory)
//   03 Congregation today (full-bleed band)
//   04 The building (pinned cross-section)
//   05 Campaign meter
//   06 Gift ladder
//   07 Where the money goes
//   08 Prayer times + visit
//   09 Events
//   10 Membership (dusk)
//   11 Trust band  (Footer lives in the locale layout, not here)
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
      <BuildingRises />
      <MotionRise><CampaignMeter /></MotionRise>
      <MotionRise><GiftLadder /></MotionRise>
      <MotionRise><WhereMoneyGoes /></MotionRise>
      <MotionRise><PrayerVisit /></MotionRise>
      <MotionRise><EventsSchedule /></MotionRise>
      <MotionRise><Membership /></MotionRise>
      <TrustBand />
    </main>
  );
}
