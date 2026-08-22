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
          <div className="grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:gap-16">
            <div>
              {/* Capped below the display token on this page only. text-display
                 tops out at 4.5rem, which set this four-line headline at 72px
                 and pushed the form card off a laptop screen. 3.5rem keeps it
                 the largest thing on the page without owning the whole fold. */}
              <h1 className="font-serif text-display text-balance text-paper md:text-[clamp(2.5rem,4.4vw,3.5rem)] md:leading-[1.05]">
                {tm.rich('headline', {
                  em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
                })}
              </h1>
              <p className="mt-5 max-w-prose text-body text-paper/75">{t('lede')}</p>

              <ul className="mt-8 grid gap-6 border-t border-paper/15 pt-6 sm:grid-cols-3">
                {points.map((k) => (
                  <li key={k}>
                    <p className="font-serif text-[1.05rem] text-paper">{t(`points.${k}.title`)}</p>
                    <p className="mt-1.5 text-[0.9rem] leading-snug text-paper/60">
                      {t(`points.${k}.body`)}
                    </p>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-[13px] text-paper/45">
                {t('members', { count: CAMPAIGN.members.toLocaleString('nb-NO') })}
              </p>
            </div>

            <div className="md:justify-self-end md:w-full">
              <MembershipSignup />
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
                {(['ordinary', 'voting', 'youth'] as const).map((k) => (
                  <div key={k} className="grid gap-2 border-b border-rule py-5 md:grid-cols-12 md:items-baseline">
                    <dt className="font-serif text-[1.15rem] text-ink md:col-span-3">
                      {t(`tiers.${k}.name`)}
                    </dt>
                    <dd className="text-body text-ink-60 md:col-span-6">{t(`tiers.${k}.body`)}</dd>
                    <dd className="font-serif text-[1.05rem] tabular-nums text-gold-deep md:col-span-3 md:text-end">
                      {t(`tiers.${k}.price`)}
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
