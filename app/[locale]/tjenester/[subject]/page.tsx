import { notFound } from 'next/navigation';
import { CAMPAIGN } from '@/lib/campaign';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { RequestForm, type RequestSubject } from '@/components/request-form';
import { ServiceHero, ServiceVisit } from '@/components/service-page';

const VALID = ['nikah', 'janaza', 'shahada', 'counselling', 'hajj-umrah', 'megling', 'barn-og-ungdom', 'skole', 'koran', 'kurs', 'veivisere'] as const;

// One render per subject, so the five pages are not the same picture five times
const SUBJECT_IMAGE: Record<(typeof VALID)[number], string> = {
  nikah: '/photos/subj-nikah.webp',
  janaza: '/photos/subj-janaza.webp',
  shahada: '/photos/subj-shahada.webp',
  counselling: '/photos/subj-counselling.webp',
  'hajj-umrah': '/photos/subj-hajj.webp',
  megling: '/photos/svc-counsel.webp',
  'barn-og-ungdom': '/photos/community/bazaar-child.webp',
  skole: '/photos/learn-school.webp',
  koran: '/photos/community/quran-carpet.webp',
  kurs: '/photos/event-lecture-hall.webp',
  veivisere: '/photos/event-school-visit.webp',
};
type Subject = (typeof VALID)[number];

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

  return (
    <main>
      <ServiceHero
        crumb={tp('crumb')}
        eyebrow={t('eyebrow')}
        title={t(`items.${s}.title`)}
        lede={t(`items.${s}.body`)}
        note={tp('pages.services.note')}
        image={SUBJECT_IMAGE[s]}
        alt={t(`items.${s}.title`)}
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
