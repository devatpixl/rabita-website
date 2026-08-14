import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { RequestForm, type RequestSubject } from '@/components/request-form';

const VALID = ['nikah', 'janaza', 'shahada', 'counselling', 'hajj-umrah'] as const;
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

  return (
    <main>
      <PageHeader eyebrow={t('eyebrow')} title={t(`items.${s}.title`)} lede={t(`items.${s}.body`)} />
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
    </main>
  );
}
