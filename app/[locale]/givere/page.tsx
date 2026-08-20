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

import { Accent } from '@/components/accent';
import {
  ProjectAssurance,
  ProjectBrief,
  ProjectColumns,
  ProjectHero,
} from '@/components/project-page';
export default async function DonorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tp = await getTranslations({ locale, namespace: 'projectPages' });
  return (
    <main>
      <ProjectHero
        crumb={tp('crumb')}
        eyebrow={tp('pages.donors.eyebrow')}
        title={tp.rich('pages.donors.title', {
          em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
        })}
        lede={tp('pages.donors.lede')}
        image="/photos/hero-donors.webp"
        alt={tp('pages.donors.eyebrow')}
        primary={{ label: tp('pages.donors.primary'), give: true }}
        secondary={{ label: tp('pages.donors.secondary'), href: `/${locale}/doner-en-bonneplass` }}
      />
      <ProjectBrief label={tp('pages.donors.briefLabel')} body={tp('pages.donors.brief')} />
      <ProjectColumns
        eyebrow={tp('pages.donors.colEyebrow')}
        heading={tp('pages.donors.colHeading')}
        items={tp.raw('pages.donors.items') as { title: string; body: string }[]}
      />
      <FoundationWall />
          <ProjectAssurance
        heading={tp('assurance.heading')}
        lede={tp('assurance.lede')}
        items={tp.raw('assurance.items') as { title: string; body: string }[]}
      />
    </main>
  );
}
