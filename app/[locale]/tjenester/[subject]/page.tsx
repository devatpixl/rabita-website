import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Eyebrow, Section, SectionBody, SectionHeading } from '@/components/primitives';
import { RequestForm, type RequestSubject } from '@/components/request-form';
import { HALL_HOST, HallBackdrop } from '@/components/hall-backdrop';
import { ServiceOpener } from '@/components/service-opener';
import { ServiceOverview } from '@/components/service-overview';
import { ServiceRelated } from '@/components/service-related';
import {
  SERVICE_KEYS,
  SERVICE_PAGES,
  type ServiceKey,
} from '@/lib/services';

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
  // Which index actually lists this subject. Read from SERVICE_PAGES rather
  // than hardcoded, so moving a subject between Tjenester and Undervisning —
  // as `kurs` moved on 2026-09-17 — carries the crumb with it.
  const isTeaching = (SERVICE_PAGES.undervisning as readonly string[]).includes(s);
  const t = await getTranslations({ locale, namespace: 'servicesIndex' });
  // nav.items.* — the words the menu itself uses for these sections, already
  // translated in all three locales, so the crumb cannot drift from the bar.
  // The `servicePages` namespace is no longer read here (its `crumb` was the
  // old two-part label); the strings stay in the message files, still used by
  // the other *Pages crumbs.
  const tnav = await getTranslations({ locale, namespace: 'nav' });

  // The service titles carry <em> for the gold-italic accent. next-intl's
  // plain t() cannot render markup — it bails and prints the key itself, which
  // is why every one of these pages showed "servicesIndex.items.<key>.title"
  // as its headline. The heading goes through t.rich; anything that needs a
  // real string (alt text, and any future <title>) gets the tags stripped.
  const plainTitle = (t.raw(`items.${s}.title`) as string).replace(/<\/?em>/g, '');


  // The one-screen ServiceSpread prototype that lived here was retired on
  // 2026-09-16: the client kept this three-section layout ("we keep like this
  // i like it") and dropped the "fit on one screen" point that the spread
  // existed to answer. components/service-spread.tsx is left in the tree,
  // unused, the same way components/service-page.tsx keeps ServiceVisit — it
  // is a working component and comes back with one branch if the one-screen
  // idea returns.

  // ── THE CONVERSION PILOT (2026-09-28) ─────────────────────────────────
  // Client: the pages "are not converting"; islamic.no/vigsel and /hajj as
  // the reference. See SERVICE_PILOT in lib/services.ts. The seventeen
  // services not on that list fall through to the 09-23 template below,
  // untouched, until he has approved this shape on nikah.
  //
  // Opener (62vh, title + line + two actions) → overview (the offer heading
  // over longBody and the numbered offer, both written long ago and never
  // rendered) → steps (only where the copy exists) → the form with the
  // practical register beside it → the membership band → three related
  // services. The phone gets a standing Send button.
  const crumb = tnav(isTeaching ? 'items.teaching' : 'items.services');
  return (
    <main>
      {/* Full-bleed photographic hero with the contact strip on its
         foot. No arcade behind it — the picture is the ground. */}
      <ServiceOpener s={s} crumb={crumb} />

      {/* The words and the sequence, one spread. */}
      <ServiceOverview s={s} />

      {/* The arcade returns behind the form, and stays behind the related
         services after it, so the sticky photograph has room to travel. */}
      <div className={HALL_HOST}>
        <HallBackdrop wash={62} />
        <Section id="enquiry" tone="none" className="scroll-mt-24 bg-paper/45 pb-20 md:pb-28">
          <SectionBody>
            <Eyebrow tone="gold-deep">{plainTitle}</Eyebrow>
            <SectionHeading className="mt-5">{t('detail.request')}</SectionHeading>
            <p className="mt-4 max-w-[42ch] text-body text-ink-60">{t('detail.requestLede')}</p>

            <div className="mt-10 md:grid md:grid-cols-12 md:items-center md:gap-12 lg:gap-16">
              <div className="md:col-span-7">
                <RequestForm subject={s as RequestSubject} card rule={false} />
                {/* ── THE E-MAIL LINE UNDER THE FORM IS GONE ─────────────
                   Client, 2026-09-30: "you invented these mails, remove
                   these lines from all services". It read "Prefer e-mail?
                   Write to <address>" and printed SERVICE_CONTACT's address
                   for the service, or post@rabita.no where there is none.

                   Removed on all eighteen, which is one deletion because
                   they share this page. detail.orWrite stays in the message
                   files unreferenced, which is this repo's convention.

                   NOTE FOR WHOEVER PICKS THIS UP: no invented address is
                   DISPLAYED anywhere after this, but SERVICE_CONTACT still
                   supplies the mailto target behind the hero's "Skriv til
                   oss" on seven services. That map is still open with the
                   client — see its own comment, which records that the
                   addresses were read off rabita.no. */}
              </div>

              {/* ── WHAT HAPPENS NEXT ─────────────────────────────────
                 The slot beside the form, third occupant. The facts
                 register and then the "Bli medlem" aside were both
                 removed on the client's instruction (2026-09-28). What
                 his reference does here that ours did not: it says what
                 happens after Send ("så tar vi kontakt innen 2–3
                 virkedager"). Three lines, all from sentences the pages
                 already carry — detail.requestLede ("så tar vi kontakt
                 for en samtale") and each service's offerLede — with
                 the last line per service (items.<s>.nextLast) and a
                 generic fallback. No promise of days: that number is the
                 client's to give, and a promise he cannot keep is worse
                 than none. */}
              {/* max-md:hidden (client, 2026-09-30: "remove this in all
                 services, under the form ... from mobiles only"). From md it
                 is the column BESIDE the form, which is what it was drawn to
                 be — three short lines in the space the form leaves. Stacked
                 on a phone it is not that: it is three more paragraphs after
                 the send button, telling someone who has just been asked to
                 act what will happen if they do. Kept in full from md. */}
              <aside className="mt-12 max-md:hidden md:col-span-5 md:mt-0 md:border-s md:border-rule md:ps-10 lg:ps-14">
                <h3 className="font-serif text-[clamp(1.3rem,1.9vw,1.55rem)] leading-[1.18] text-ink">{t('detail.next')}</h3>
                <ol className="mt-5">
                  {(t.raw('detail.nextSteps') as string[]).map((line, i, arr) => {
                    const isLast = i === arr.length - 1;
                    const text = isLast && t.has(`items.${s}.nextLast`) ? t(`items.${s}.nextLast`) : line;
                    return (
                      <li key={i} className="flex gap-4 border-t border-rule py-3.5 first:border-t-0 first:pt-0">
                        <span className="pt-[0.3rem] font-mono text-[0.6875rem] tabular-nums tracking-[0.18em] text-gold-deep">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="font-serif text-[1.15rem] leading-snug text-ink">{text}</p>
                      </li>
                    );
                  })}
                </ol>
              </aside>
            </div>
          </SectionBody>
        </Section>

        <ServiceRelated s={s} locale={locale} />
      </div>

      {/* The pinned "Send henvendelse" that stood bottom-start on phones is
         GONE (client, 2026-09-30). It was added on 2026-09-28 because the
         form is four screens below the opener, but the opener now carries a
         single action rather than two, the contact button is a disc in the
         other corner, and three floating things on a 390px screen is two too
         many. components/service-sticky-cta.tsx is deleted with it; git has
         it if the reasoning ever changes. */}
    </main>
  );


}
