import { notFound } from 'next/navigation';
import { CAMPAIGN } from '@/lib/campaign';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { RequestForm, type RequestSubject } from '@/components/request-form';
import { ServiceHero, ServiceVisit } from '@/components/service-page';
import { Accent } from '@/components/accent';
import { SERVICE_KEYS, SERVICE_IMAGE, type ServiceKey } from '@/lib/services';

const VALID = SERVICE_KEYS;

type Subject = ServiceKey;

export function generateStaticParams() {
  return VALID.flatMap((subject) =>
    ['no', 'en', 'ar'].map((locale) => ({ locale, subject })),
  );
}

export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ locale: string; subject: string }>;
}) {
  const { locale, subject } = await params;
  if (!(VALID as readonly string[]).includes(subject)) notFound();
  setRequestLocale(locale);
  const s = subject as Subject;
  const t = await getTranslations({ locale, namespace: 'servicesIndex' });
  const tp = await getTranslations({ locale, namespace: 'servicePages' });

  // The service titles carry <em> for the gold-italic accent. next-intl's
  // plain t() cannot render markup — it bails and prints the key itself, which
  // is why every one of these pages showed "servicesIndex.items.<key>.title"
  // as its headline. The heading goes through t.rich; anything that needs a
  // real string (alt text, and any future <title>) gets the tags stripped.
  const plainTitle = (t.raw(`items.${s}.title`) as string).replace(/<\/?em>/g, '');

  return (
    <main>
      <ServiceHero
        crumb={tp('crumb')}
        eyebrow={t('eyebrow')}
        title={t.rich(`items.${s}.title`, {
          em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
        })}
        lede={t(`items.${s}.body`)}
        note={tp('pages.services.note')}
        image={SERVICE_IMAGE[s]}
        alt={plainTitle}
      />
      <Section tone="paper">
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-6 space-y-4">
              <SectionHeading>{t('detail.what')}</SectionHeading>
              <p className="text-body text-ink">{t(`items.${s}.longBody`)}</p>
            </div>
            <div className="md:col-span-6">
              <SectionHeading>{t('detail.request')}</SectionHeading>
              <div className="mt-6">
                <RequestForm subject={s as RequestSubject} />
              </div>
            </div>
          </div>
        </SectionBody>
      </Section>
      <ServiceVisit
        heading={tp('visit.heading')}
        body={tp('visit.body')}
        address={CAMPAIGN.address}
        postal={CAMPAIGN.postalCity}
        hours={tp('visit.hours')}
        primary={{ label: tp('visit.primary'), href: `/${locale}/besok-oss` }}
        secondary={{ label: tp('visit.secondary'), href: `/${locale}/kontakt` }}
      />
    </main>
  );
}
