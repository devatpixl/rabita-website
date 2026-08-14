// The donor wall page.
//
// NOT LINKED FROM THE HOMEPAGE until Rabita has real, GDPR-consented
// donor records at sufficient scale to read as proof of support. This
// route exists so the section has a home to grow into — currently it
// renders an empty state and nothing else. When there is real data,
// re-link from the homepage.
//
// See lib/donor-wall.ts for the data source and the invariant that no
// name is rendered without a recorded consent flag on the underlying
// donor record.

import { setRequestLocale, getTranslations } from 'next-intl/server';
import { FoundationWall } from '@/components/foundation-wall';
import { PageHeader } from '@/components/page-header';

export default async function DonorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'donorsPage' });

  return (
    <main>
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        lede={t('lede')}
      />
      <FoundationWall />
    </main>
  );
}
