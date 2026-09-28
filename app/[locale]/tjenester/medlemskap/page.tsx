import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { GiveSheetButton } from '@/components/give-sheet-button';
import { HALL_HOST, HallBackdrop } from '@/components/hall-backdrop';
import { Section, SectionBody } from '@/components/primitives';
import { ServiceHero } from '@/components/service-hero';

// Membership, as a service (client, ticket "Nettside medlemskap",
// 2026-09-18): "Jeg ønsker også tjenester en egen fane for medlemskap. I den
// så kan du ha med: 1. Utmelding, 2. Dobbelt medlemskap, 3. Donasjon." And
// for the second: "noe lignende det her:
// https://www.human.no/bli-medlem/dobbelt-medlemskap".
//
// THE SAME PAGE AS THE OTHER EIGHTEEN, with one section swapped. The user's
// instruction (2026-09-28): "follow the format of the rest of the service
// pages ... keep the info we have but keep style and bg same." So this is
// the service template — the arcade backdrop, the merged opener with the
// photograph off the end edge, the paper/45 second half — and where a
// service puts its enquiry form, this page puts the three blocks he listed.
//
// A STATIC ROUTE UNDER THE DYNAMIC ONE. Next resolves this segment ahead of
// /tjenester/[subject]. It is NOT a SERVICE_KEY: that would put a tile in
// the picture grid with a request form under it, and the form is the one
// part of the template membership does not want. ServiceHero reads its copy
// from the membershipHub namespace instead of servicesIndex.items — see the
// note on its props. It reaches the menu through nav.menu.services and the
// index through a strip under the grid (tjenester/page.tsx).
//
// THE DOBBELT MEDLEMSKAP TEXT follows human.no's page, which the client
// pointed at: the grant is per member and per member ONCE, Brønnøysund
// compares the registers at New Year, a person on two lists earns nobody the
// grant, the organisation is not told where else, so only the member can fix
// it. The one Rabita-specific turn is what the grant is for: the building.
//
// TWO DIFFERENT "UTMELDING" ON ONE PAGE, and the page says so. Block 01
// links to /utmelding, which is leaving RABITA. Block 02 links to
// utmelding.rabita.no, a separate tool (Netlify) for leaving OTHER faith
// communities so that a Rabita membership counts. The note under that
// button exists because the two would otherwise read as the same thing.
const UTMELDING_TOOL = 'https://utmelding.rabita.no';
const BRREG = 'https://www.brreg.no/';

// story-members.webp: the one photograph in the library that is literally
// of members, and the frame /bli-medlem opens on — so the two membership
// pages look at the same people. 2000x860, landscape; 30% keeps the row of
// faces above the fade.
const STORY = { src: '/photos/story-members.webp', objectClass: 'object-[50%_30%]' };

export default async function MembershipHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'membershipHub' });
  const tnav = await getTranslations({ locale, namespace: 'nav' });
  const p = (path: string) => `/${locale}${path}`;

  const pill =
    'inline-flex min-h-11 items-center gap-2 rounded-full bg-gold-deep px-5 text-[14px] font-semibold text-paper transition-colors hover:bg-ink';
  const pillQuiet =
    'inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/25 bg-paper/60 px-5 text-[14px] font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper';
  const arrow = (
    <span aria-hidden className="rtl:rotate-180">
      &rarr;
    </span>
  );
  const label = 'font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep';
  const heading = 'font-serif text-[clamp(1.5rem,2.6vw,2rem)] leading-tight text-ink';
  const body = 'max-w-[58ch] text-body leading-relaxed text-ink-60';

  return (
    <main>
      {/* One backdrop under both halves, exactly as [subject]/page.tsx does
         it — see the note there on why per-section backdrops never stick. */}
      <div className={HALL_HOST}>
        <HallBackdrop wash={62} />

        <ServiceHero
          ns="membershipHub"
          crumb={tnav('items.services')}
          story={STORY}
          short={t('kicker')}
          cta={{ href: p('/bli-medlem'), label: t('join.cta') }}
        />

        {/* Where a service has its enquiry form: the three blocks, on the
           same paper/45 ground with the same bottom padding, so the page
           ends the way its eighteen siblings end. */}
        <Section id="medlemskap" tone="none" className="scroll-mt-24 bg-paper/45 pb-20 md:pb-28">
          <SectionBody>
            <ol className="divide-y divide-rule border-y border-rule">
              {/* 01 — leaving Rabita */}
              <li id="utmelding" className="grid gap-6 py-10 md:grid-cols-12 md:gap-10 md:py-14">
                <div className="md:col-span-4">
                  <p className={label}>
                    {t('leave.index')} · {t('leave.eyebrow')}
                  </p>
                </div>
                <div className="md:col-span-8">
                  <h2 className={heading}>{t('leave.heading')}</h2>
                  <p className={`mt-4 ${body}`}>{t('leave.body')}</p>
                  <div className="mt-6">
                    <Link href={p('/utmelding')} className={pillQuiet}>
                      {t('leave.cta')}
                      {arrow}
                    </Link>
                  </div>
                </div>
              </li>

              {/* 02 — registered in two places */}
              <li id="dobbelt-medlemskap" className="grid gap-6 py-10 md:grid-cols-12 md:gap-10 md:py-14">
                <div className="md:col-span-4">
                  <p className={label}>
                    {t('dual.index')} · {t('dual.eyebrow')}
                  </p>
                </div>
                <div className="md:col-span-8">
                  <h2 className={heading}>{t('dual.heading')}</h2>
                  <div className={`mt-4 space-y-4 ${body}`}>
                    <p>{t('dual.p1')}</p>
                    <p>{t('dual.p2')}</p>
                    <p>{t('dual.p3')}</p>
                    <p>{t('dual.p4')}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href={UTMELDING_TOOL} target="_blank" rel="noreferrer" className={pillQuiet}>
                      {t('dual.toolCta')}
                      {arrow}
                    </a>
                    <a href={BRREG} target="_blank" rel="noreferrer" className={pillQuiet}>
                      {t('dual.checkCta')}
                      {arrow}
                    </a>
                  </div>
                  <p className="mt-3 max-w-[58ch] text-[13px] leading-snug text-ink-60">{t('dual.toolNote')}</p>
                </div>
              </li>

              {/* 03 — giving */}
              <li id="donasjon" className="grid gap-6 py-10 md:grid-cols-12 md:gap-10 md:py-14">
                <div className="md:col-span-4">
                  <p className={label}>
                    {t('give.index')} · {t('give.eyebrow')}
                  </p>
                </div>
                <div className="md:col-span-8">
                  <h2 className={heading}>{t('give.heading')}</h2>
                  <p className={`mt-4 ${body}`}>{t('give.body')}</p>
                  {/* Opens the giving sheet, the way the header's button
                     does. Nothing on the site links to /gi-en-gave as a
                     page, and this was about to be the one thing that did. */}
                  <div className="mt-6">
                    <GiveSheetButton className={pill}>
                      {t('give.cta')}
                      {arrow}
                    </GiveSheetButton>
                  </div>
                </div>
              </li>
            </ol>

            {/* The address the client named for everything about membership. */}
            <p className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[15px] text-ink-60 md:mt-10">
              {t('contact.prompt')}
              <a
                href={`mailto:${CAMPAIGN.membershipEmail}`}
                className="font-semibold text-ink underline decoration-gold-deep/50 underline-offset-4 transition-colors hover:decoration-ink"
              >
                {t('contact.cta', { email: CAMPAIGN.membershipEmail })}
              </a>
            </p>
          </SectionBody>
        </Section>
      </div>
    </main>
  );
}
