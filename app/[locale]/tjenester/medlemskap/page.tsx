import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Accent } from '@/components/accent';
import { PageHeading } from '@/components/page-heading';
import { Section, SectionBody } from '@/components/primitives';

// Membership, as a service (client, ticket "Nettside medlemskap",
// 2026-09-18): "Jeg ønsker også tjenester en egen fane for medlemskap. I den
// så kan du ha med: 1. Utmelding, 2. Dobbelt medlemskap, 3. Donasjon." And
// for the second: "noe lignende det her:
// https://www.human.no/bli-medlem/dobbelt-medlemskap".
//
// A STATIC ROUTE UNDER THE DYNAMIC ONE. /tjenester/[subject] renders the
// eighteen services from lib/services.ts, each with a photograph, a story,
// an offer list and the enquiry form. Membership is none of those things —
// it is three short answers and four links — so it is its own page here,
// and Next resolves the static segment ahead of [subject]. It is NOT a
// SERVICE_KEY: adding one would have put a "Medlemskap" tile in the picture
// grid with a request form under it, which is the wrong shape for this.
// It reaches the menu through nav.menu.services and the index through a
// strip under the grid (tjenester/page.tsx), which is what "en egen fane"
// asked for.
//
// THE DOBBELT MEDLEMSKAP TEXT follows human.no's page, which the client
// pointed at: the grant is per member and per member ONCE, Brønnøysund
// compares the registers at New Year, a person on two lists earns nobody the
// grant, the organisation is not told where else, so only the member can fix
// it. The one Rabita-specific turn is what the grant is for: the building.
//
// TWO DIFFERENT "UTMELDING" ON ONE PAGE, and the page says so. Section 01
// links to /utmelding, which is leaving RABITA. Section 02 links to
// utmelding.rabita.no, a separate tool (Netlify) for leaving OTHER faith
// communities so that a Rabita membership counts. The note under that
// button exists because the two would otherwise read as the same thing.
const UTMELDING_TOOL = 'https://utmelding.rabita.no';
const BRREG = 'https://www.brreg.no/';

export default async function MembershipHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'membershipHub' });
  const tp = await getTranslations({ locale, namespace: 'servicePages' });
  const p = (path: string) => `/${locale}${path}`;

  const pill =
    'inline-flex min-h-11 items-center gap-2 rounded-full bg-gold-deep px-5 text-[14px] font-semibold text-paper transition-colors hover:bg-ink';
  const pillQuiet =
    'inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/25 px-5 text-[14px] font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper';
  const arrow = (
    <span aria-hidden className="rtl:rotate-180">
      &rarr;
    </span>
  );

  return (
    <main>
      <PageHeading
        kicker={tp('pages.services.eyebrow')}
        kickerNote={t('kicker')}
        title={t.rich('title', {
          em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
        })}
        lede={t('lede')}
      />

      <Section pad="tight" className="!pt-0">
        <SectionBody>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-ink-60">
            {t('join.prompt')}
            <Link href={p('/bli-medlem')} className={pill}>
              {t('join.cta')}
              {arrow}
            </Link>
          </p>

          {/* Three numbered blocks on one rule, in the client's order. Each
             is a heading, a paragraph or four, and the links that answer it.
             No photographs: the page is a signpost, and the pages it points
             to carry the pictures. */}
          <ol className="mt-12 divide-y divide-rule border-t border-rule md:mt-16">
            {/* 01 — leaving Rabita */}
            <li id="utmelding" className="grid gap-6 py-10 md:grid-cols-12 md:gap-10 md:py-14">
              <div className="md:col-span-4">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
                  {t('leave.index')} · {t('leave.eyebrow')}
                </p>
              </div>
              <div className="md:col-span-8">
                <h2 className="font-serif text-[clamp(1.5rem,2.6vw,2rem)] leading-tight text-ink">{t('leave.heading')}</h2>
                <p className="mt-4 max-w-[58ch] text-body leading-relaxed text-ink-60">{t('leave.body')}</p>
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
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
                  {t('dual.index')} · {t('dual.eyebrow')}
                </p>
              </div>
              <div className="md:col-span-8">
                <h2 className="font-serif text-[clamp(1.5rem,2.6vw,2rem)] leading-tight text-ink">{t('dual.heading')}</h2>
                <div className="mt-4 max-w-[58ch] space-y-4 text-body leading-relaxed text-ink-60">
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
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
                  {t('give.index')} · {t('give.eyebrow')}
                </p>
              </div>
              <div className="md:col-span-8">
                <h2 className="font-serif text-[clamp(1.5rem,2.6vw,2rem)] leading-tight text-ink">{t('give.heading')}</h2>
                <p className="mt-4 max-w-[58ch] text-body leading-relaxed text-ink-60">{t('give.body')}</p>
                <div className="mt-6">
                  <Link href={p('/gi-en-gave')} className={pill}>
                    {t('give.cta')}
                    {arrow}
                  </Link>
                </div>
              </div>
            </li>
          </ol>

          {/* The address the client named for everything about membership. */}
          <p className="mt-10 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-rule pt-8 text-[15px] text-ink-60 md:mt-14">
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
    </main>
  );
}
