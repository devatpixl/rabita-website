import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { PageHeader } from '@/components/page-header';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';

// Combined privacy + accessibility statement — universell utforming is a
// legal requirement in Norway (§8). Content is plain and short so a donor
// reads it in under a minute.
export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'privacyPage' });

  return (
    <main>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />

      <Section tone="paper" id="personvern">
        <SectionBody>
          <SectionHeading>{t('privacy.heading')}</SectionHeading>
          <div className="mt-6 space-y-6 max-w-prose text-body text-ink">
            <p>{t('privacy.controller', { orgNr: CAMPAIGN.orgNr })}</p>
            <p>{t('privacy.dataWeCollect')}</p>
            <p>{t('privacy.fnr')}</p>
            <p>{t('privacy.hosting')}</p>
            <p>{t('privacy.rights')}</p>
            <p>
              {t('privacy.contact')}{' '}
              <a href={`mailto:${CAMPAIGN.contactEmail}`} className="inline-flex min-h-11 items-center underline">
                {CAMPAIGN.contactEmail}
              </a>
            </p>
          </div>
        </SectionBody>
      </Section>

      <Section tone="paper-2" id="tilgjengelighet">
        <SectionBody>
          <SectionHeading>{t('a11y.heading')}</SectionHeading>
          <div className="mt-6 space-y-6 max-w-prose text-body text-ink">
            <p>{t('a11y.wcag')}</p>
            <ul className="ms-6 list-disc space-y-2 text-ink-60">
              <li>{t('a11y.list.contrast')}</li>
              <li>{t('a11y.list.keyboard')}</li>
              <li>{t('a11y.list.textsize')}</li>
              <li>{t('a11y.list.rtl')}</li>
              <li>{t('a11y.list.altText')}</li>
            </ul>
            <p>{t('a11y.feedback')}</p>
          </div>
        </SectionBody>
      </Section>
    </main>
  );
}
