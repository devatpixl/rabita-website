import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Accent } from '@/components/accent';
import { Faq } from '@/components/faq';
import { FigureIcon, type FigureIconName } from '@/components/figure-icons';
import { PageBand } from '@/components/page-band';
import { Eyebrow, Section, SectionBody, SectionHeading } from '@/components/primitives';
import { UtmeldingForm } from '@/components/utmelding-form';

// Leaving Rabita — the client's page, built to his mock.
//
// Ticket "Nettside medlemskap" (2026-09-17): "kan du lage noe tilsvarende
// dette https://www.iman.no/utmeldingimansenter — men ikke fullt så
// stimulerende hvis du skjønner. Utmeldingsskjema nederst kan linkes til
// mail adressen: medlemskap@rabita.no." Then, the next day, three
// screenshots of a page he had drafted himself, which this follows section
// for section: a dark hero, three cards on what membership carries, a calm
// "your choice" block, four questions, the form.
//
// WHAT "NOT SO STIMULATING" RULES OUT. iman.no's page puts five "I want to
// stay" buttons before the one that leaves, and argues with the reader in
// quotation marks. His mock does the opposite: it states what a membership
// does, says the decision was never ours, and then hands over the form. So
// there is no stay button here at all — the only calls to action are "write
// to us" and "remove my membership". Where his copy was visible in the
// screenshots it is used word for word; the three FAQ answers he had
// collapsed are written to match the one he had open.
//
// THIS IS NOT utmelding.rabita.no. That subdomain is a separate tool, live
// on Netlify, for leaving OTHER faith communities so that a Rabita
// membership counts for the state grant. This page is for leaving Rabita.
// Both are "utmelding"; the link text anywhere near either has to say
// which.
//
// The section-two card reading "the state grant moves with you" is the same
// funding claim /bli-medlem makes and carries the same flag: it is a
// statement about how Rabita is financed. Confirm the wording with him.
const CARDS = ['vote', 'grant', 'community'] as const;
const CARD_ICONS: Record<(typeof CARDS)[number], FigureIconName> = {
  vote: 'check',
  grant: 'building',
  community: 'people',
};
const FAQ = ['cost', 'rejoin', 'data', 'attend'] as const;

export default async function UtmeldingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'utmeldingPage' });

  return (
    <main>
      {/* proj-main-hall.webp, the HLF render of the prayer hall — the same
         interior /bli-medlem uses as its ground, so joining and leaving look
         at the same room. Warm, like his mock's hero, which is the same room in evening light; the
         page is quieter than /bli-medlem in its copy, not its picture. */}
      <PageBand
        kicker={t('eyebrow')}
        title={t.rich('title', {
          em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
        })}
        lede={t('lede')}
        image="/photos/proj-main-hall.webp"
        alt={t('imageAlt')}
        layout="over"
        mark="none"
        tone="warm"
        objectClass="object-[70%_50%]"
      />

      {/* Three cards, his section two. Text on paper-2 plates with a small
         disc for the icon — the mock's own shape. No numbers, no rules. */}
      <Section id="for-du-bestemmer-deg" pad="tight">
        <SectionBody>
          <Eyebrow tone="gold-deep">{t('before.eyebrow')}</Eyebrow>
          <SectionHeading className="mt-3">{t('before.heading')}</SectionHeading>
          <p className="mt-4 max-w-[56ch] text-body text-ink-60">{t('before.lede')}</p>

          <ul className="mt-9 grid gap-4 md:grid-cols-3 md:gap-5">
            {CARDS.map((k) => (
              <li key={k} className="rounded-2xl bg-paper-2 p-6 sm:p-7">
                <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-sage text-ink">
                  <FigureIcon name={CARD_ICONS[k]} className="h-[18px] w-[18px]" />
                </span>
                <h3 className="mt-5 font-mono text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink">
                  {t(`before.items.${k}.title`)}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-60">{t(`before.items.${k}.body`)}</p>
              </li>
            ))}
          </ul>
        </SectionBody>
      </Section>

      {/* His section three: a sage plate, the sentence that carries the whole
         page, and a photograph of the congregation. members-embrace.webp is
         a portrait of two members embracing after a gathering — near enough
         to the photograph in his mock to be the same idea. */}
      <Section pad="tight" tone="none">
        <SectionBody>
          <div className="grid items-center gap-8 overflow-hidden rounded-[1.75rem] bg-sage p-7 sm:p-10 lg:grid-cols-12 lg:gap-12 lg:p-12">
            <div className="lg:col-span-7">
              <Eyebrow tone="ink" className="text-ink-60">{t('choice.eyebrow')}</Eyebrow>
              <h2 className="mt-4 max-w-[22ch] font-serif text-[clamp(1.6rem,3vw,2.3rem)] leading-[1.15] text-ink">
                {t('choice.heading')}
              </h2>
              <p className="mt-5 max-w-[52ch] text-body leading-relaxed text-ink-60">{t('choice.body')}</p>
              <p className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[14.5px] text-ink-60">
                {t('choice.prompt')}
                <a
                  href={`mailto:${CAMPAIGN.membershipEmail}`}
                  className="font-semibold text-ink underline decoration-ink/40 underline-offset-4 transition-colors hover:decoration-ink"
                >
                  {t('choice.cta')}
                </a>
              </p>
            </div>
            <div className="relative aspect-[4/5] w-full max-w-[20rem] overflow-hidden rounded-2xl justify-self-center lg:col-span-5 lg:max-w-none">
              <Image
                src="/photos/members-embrace.webp"
                alt={t('choice.imageAlt')}
                fill
                sizes="(min-width: 1024px) 380px, 320px"
                className="object-cover"
              />
            </div>
          </div>
        </SectionBody>
      </Section>

      {/* Four questions, the first open. */}
      <Section id="sporsmal" pad="tight">
        <SectionBody>
          <div className="max-w-[46rem]">
            <Eyebrow tone="ink" className="text-ink-60">{t('faq.eyebrow')}</Eyebrow>
            <SectionHeading className="mt-3">{t('faq.heading')}</SectionHeading>
            <Faq
              className="mt-8"
              items={FAQ.map((k) => ({ id: k, q: t(`faq.items.${k}.q`), a: t(`faq.items.${k}.a`) }))}
            />
          </div>
        </SectionBody>
      </Section>

      {/* The form, last, beside a photograph — his section five. The photo
         is a window in the building; the mock's was light through a
         mashrabiya, which the library does not have at a usable size. */}
      <Section id="skjema" pad="tight">
        <SectionBody>
          <div className="grid overflow-hidden rounded-[1.75rem] bg-paper-2 ring-1 ring-ink/[0.06] lg:grid-cols-12">
            <div className="relative min-h-[16rem] lg:col-span-5 lg:min-h-0">
              <Image
                src="/photos/gift-window.webp"
                alt={t('form.imageAlt')}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-[45%_50%]"
              />
            </div>
            <div className="lg:col-span-7">
              <UtmeldingForm />
            </div>
          </div>
        </SectionBody>
      </Section>
    </main>
  );
}
