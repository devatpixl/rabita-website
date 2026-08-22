import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Accent } from '@/components/accent';
import { MembershipSignup } from '@/components/membership-signup';
import { Section, SectionBody } from '@/components/primitives';

// The join flow, on its own route.
//
// /medlemskap explains what membership IS; this is where someone actually
// signs. Splitting them means the page a "Become a member" button lands on
// is a form, not an essay — the meeting's complaint was that joining is too
// difficult, and the first thing a would-be member met was three tiers of
// prose.
//
// Laid out like the homepage hero on purpose: argument on the left of a
// dark split, card on the right. That pairing is the site's proven
// conversion shape, and it says a membership is the same order of
// commitment as a gift rather than a form buried on an inner page.
export default async function JoinPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'joinPage' });
  const tm = await getTranslations({ locale, namespace: 'membership' });

  // updates first, vote second. Two of the three memberships on this page
  // carry no vote at all, so leading on the ballot mis-sold the free tiers to
  // every reader who is here to join rather than to govern.
  const points = ['updates', 'vote', 'renewal'] as const;

  return (
    <main>
      {/* section-md, not -lg. The card on the right is the point of this
         page and on a 900px-tall laptop it was running off the bottom of
         the screen before the reader ever saw the Join button. */}
      <section className="bg-dusk py-section-md text-paper">
        <SectionBody>
          {/* Three blocks in DOM order: the pitch, the form, then the
             reasons. On a phone that is exactly the order a visitor wants,
             and it is what this page was getting wrong: the form sat under a
             four line headline, a four line paragraph, three explanatory
             points and a membership count, so joining meant scrolling past
             roughly a thousand pixels of argument first.

             On desktop the grid puts the pitch and the reasons back in one
             column with the card beside them, spanning both rows, which is
             the layout that was there before. Explicit row and column
             placement is what lets one DOM order serve both. */}
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:items-start md:gap-x-16 md:gap-y-10">
            <div className="md:col-start-1 md:row-start-1">
              {/* Down a step again on phones. At 40px the headline ran to four
                 lines and owned the screen on its own. */}
              <h1 className="font-serif text-[clamp(1.9rem,7.4vw,2.4rem)] leading-[1.08] text-balance text-paper md:text-[clamp(2.5rem,4.4vw,3.5rem)] md:leading-[1.05]">
                {tm.rich('headline', {
                  em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
                })}
              </h1>
              {/* One line on a phone, the full argument on desktop. The three
                 points below the form say the rest either way. */}
              <p className="mt-4 max-w-prose text-body text-paper/75 md:hidden">
                {t('ledeShort')}
              </p>
              <p className="mt-5 hidden max-w-prose text-body text-paper/75 md:block">
                {t('lede')}
              </p>
            </div>

            <div className="md:col-start-2 md:row-start-1 md:row-span-2 md:justify-self-end md:w-full">
              <MembershipSignup />
            </div>

            <div className="md:col-start-1 md:row-start-2">
              <ul className="grid gap-5 border-t border-paper/15 pt-6 sm:grid-cols-3 sm:gap-6">
                {points.map((k) => (
                  <li key={k}>
                    <p className="font-serif text-[1rem] text-paper md:text-[1.05rem]">
                      {t(`points.${k}.title`)}
                    </p>
                    <p className="mt-1 text-[0.875rem] leading-snug text-paper/60 md:mt-1.5 md:text-[0.9rem]">
                      {t(`points.${k}.body`)}
                    </p>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-[13px] text-paper/45">
                {t('members', { count: CAMPAIGN.members.toLocaleString('nb-NO') })}
              </p>
            </div>
          </div>
        </SectionBody>
      </section>

      <Section tone="paper">
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-12 md:gap-16">
            <h2 className="font-serif text-section text-balance text-ink md:col-span-5">
              {t('explain.heading')}
            </h2>
            <div className="md:col-span-7">
              <dl className="border-t border-rule">
                {/* Name and price share a line on a phone, with the sentence
                   under them. Stacked in three separate rows it took three
                   times the height and stopped reading as a comparison, which
                   is the only reason this table exists. */}
                {(['ordinary', 'voting', 'youth'] as const).map((k) => (
                  <div
                    key={k}
                    className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b border-rule py-4 md:grid-cols-12 md:items-baseline md:gap-2 md:py-5"
                  >
                    <dt className="col-start-1 row-start-1 font-serif text-[1.05rem] text-ink md:col-span-3 md:text-[1.15rem]">
                      {t(`tiers.${k}.name`)}
                    </dt>
                    <dd className="col-start-2 row-start-1 text-end font-serif text-[1rem] tabular-nums text-gold-deep md:col-span-3 md:col-start-10 md:text-[1.05rem]">
                      {t(`tiers.${k}.price`)}
                    </dd>
                    <dd className="col-span-2 row-start-2 text-[0.9rem] leading-snug text-ink-60 md:col-span-6 md:col-start-4 md:row-start-1 md:text-body md:leading-normal">
                      {t(`tiers.${k}.body`)}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 max-w-prose text-[13px] text-ink-60">{t('explain.note')}</p>
            </div>
          </div>
        </SectionBody>
      </Section>
    </main>
  );
}
