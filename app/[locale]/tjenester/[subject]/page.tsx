import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Eyebrow, Section, SectionBody, SectionHeading } from '@/components/primitives';
import { RequestForm, type RequestSubject } from '@/components/request-form';
import { Accent } from '@/components/accent';
import { cn } from '@/lib/cn';
import { HALL_HOST, HallBackdrop } from '@/components/hall-backdrop';
import {
  galleryOrientation,
  SERVICE_KEYS,
  SERVICE_PAGES,
  SERVICE_STORY,
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
  // Address / Phone / E-mail, already translated for the footer's own
  // find-us block. Three labels for no new strings.
  const tm = await getTranslations({ locale, namespace: 'membership' });
  // /bli-medlem's own copy — the benefits of joining, already written in all
  // three locales. The aside beside the enquiry form previews the page it links to.
  const tj = await getTranslations({ locale, namespace: 'joinPage' });
  const tmp = await getTranslations({ locale, namespace: 'medlemskapPage' });

  // The service titles carry <em> for the gold-italic accent. next-intl's
  // plain t() cannot render markup — it bails and prints the key itself, which
  // is why every one of these pages showed "servicesIndex.items.<key>.title"
  // as its headline. The heading goes through t.rich; anything that needs a
  // real string (alt text, and any future <title>) gets the tags stripped.
  const plainTitle = (t.raw(`items.${s}.title`) as string).replace(/<\/?em>/g, '');

  // Measured from the actual file, not assumed — SERVICE_STORY runs 1125x1500
  // portrait on some services and 1312x736 landscape on others, and a single
  // locked frame would crop about half of one group away.
  const story = SERVICE_STORY[s];
  const storyOrientation = story ? galleryOrientation([story.src]) : 'landscape';

  // The one-screen ServiceSpread prototype that lived here was retired on
  // 2026-09-16: the client kept this three-section layout ("we keep like this
  // i like it") and dropped the "fit on one screen" point that the spread
  // existed to answer. components/service-spread.tsx is left in the tree,
  // unused, the same way components/service-page.tsx keeps ServiceVisit — it
  // is a working component and comes back with one branch if the one-screen
  // idea returns.

  return (
    <main>
      {/* The band, in the family the prayer page opens on (client,
         2026-09-05). `split` rather than `over` because the subject photos
         are 1086-1600px wide: in a full-measure band subj-nikah would be
         upscaling, and a 240px letterbox would cut through the faces.

         The accent MUST be surface="dusk" here. accent.tsx maps paper to
         #9B7F4A and dusk to #C0A165; the paper gold on a dusk plate is far
         too dim to read.

         The kicker's second half is the service's own family, from
         servicesIndex.groups — copy that already exists in all three
         locales, so ten pages get four distinct kickers for no new
         strings. */}
      {/* ── THE TEXT-ONLY HEADER ──────────────────────────────────────
         No photograph, per the client. What replaces it is the header
         language from /om-oss, which he approved there: a short gold
         rule, the gold mono label under it, then the title at display size
         and the lede at reading size.

         THE GROUND CHANGES FROM DUSK TO PAPER, and that is the point.
         PageBand's plate is dark because it has to hold a photograph and
         keep white type legible over it. With the picture gone, a dark
         slab carrying three lines of text is a heavy object with nothing
         in it — the same fault as an empty column. On paper the type is
         the object.

         WHICH MEANS THE ACCENT SWAPS TOO: accent.tsx maps paper to #9B7F4A
         and dusk to #C0A165, and the note on the band below says the paper
         gold is far too dim on a dusk plate. The reverse is just as true —
         the dusk gold on paper is washed out. surface="paper" here is not
         interchangeable with the band's surface="dusk".

         The kicker keeps both halves the band had — the crumb and the
         service's own family from servicesIndex.groups — joined by a
         hairline rather than stacked, so the label stays one line.

       <h1>, matching PageBand, so the page keeps exactly one.

         ── SHORT-LAPTOP COMPACTION ──────────────────────────────────────
         Client, 2026-09-18: "looked good in desktop, but on macbook 13 and
         14 inches its too big ... too much empty space at top".

         Targeted by VIEWPORT HEIGHT, not width, because that is the actual
         variable: a 13" Air and a 27" monitor are both "desktop" by width and
         differ by ~400px of height. min-width:768px keeps phones out of it
         (a phone is short too, and its pt-10 is already right).

         Above 900px tall nothing below changes, so the desktop view he
         approved is untouched. Under it: 64 -> 28px above the kicker, the
         gaps above the title and lede roughly halve, the title's own cap
         comes down 68 -> 52px, and section 2 rises by the same 28px so the
         whole opening moves up together rather than just spreading out.

         Same instrument giving-card.tsx already uses for the hero card. */}
      <section className="bg-paper pt-10 md:pt-16 [@media(min-width:768px)_and_(max-height:900px)]:pt-7">
        <SectionBody>
            {/* NO LEADING RULE (client, 2026-09-18: "dont like this the too
             much -------, remove it").

             On /om-oss the same rule sits ABOVE its label, where it reads
             as a section mark. Inline, ahead of the words, it reads as a
             dash — and this kicker already has a divider in it, so the line
             carried two horizontal marks before it carried any meaning.
             The label alone is enough. The divider between the two halves
             stays: it is separating two real things. */}
          {/* ONE WORD: the section this page belongs to, named exactly as the
             nav names it (client, 2026-09-18: "only 1 word like services").
             
             It used to be two halves joined by a hairline — the hardcoded
             servicePages.crumb plus the service's own family from
             servicesIndex.groups. Three things were wrong with that:
             
               1. servicePages.crumb is ONE string, "Bønn og tjenester", so
                  it was printed on all eighteen subjects including the five
                  teaching ones, naming a section the visitor had not come
                  from.
               2. The two halves restated each other. "PRAYER AND SERVICES |
                  RELIGIOUS SERVICES" says "services" twice and adds nothing
                  the headline underneath does not already say, and on a
                  teaching subject it read "PRAYER AND SERVICES | TEACHING",
                  which contradicts itself inside one line.
               3. It did not match the nav. The bar says "Tjenester" and
                  "Undervisning"; the crumb said neither.
             
             So the label is nav.items.* — the same word the visitor just
             clicked, already translated in all three locales. Nothing new to
             write, and the crumb can no longer drift from the menu.
             
             servicesIndex.groups is untouched in the message files; the
             services index still uses it to head its groups. */}
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
            {tnav(isTeaching ? 'items.teaching' : 'items.services')}
          </p>

          <h1 className="mt-7 max-w-[18ch] font-serif text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1.02] tracking-[-0.02em] text-balance text-ink [@media(min-width:768px)_and_(max-height:900px)]:mt-4 [@media(min-width:768px)_and_(max-height:900px)]:text-[clamp(2rem,4.4vw,3.25rem)]">
            {t.rich(`items.${s}.title`, {
              em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
            })}
          </h1>

          <p className="mt-8 max-w-[56ch] text-[clamp(1rem,1.15vw,1.125rem)] leading-relaxed text-ink-60 [@media(min-width:768px)_and_(max-height:900px)]:mt-4">
            {t(`items.${s}.body`)}
          </p>
        </SectionBody>
      </section>

      {/* ── 2. What we offer ───────────────────────────────────────────────
         The client's mockup (2026-09-06): eyebrow, headline and a short
         lede on one side, and on the other a numbered list of what the
         service actually involves.

         Third design for this section. The first was a large invented
         line-drawing per service — "looks fake", and it was. The second was
         the drawing removed and the sentence centred on its own — "very
         basic", and it was. Both failed on the same thing and it was never
         the treatment: the section had one paragraph in it. The four points
         per service now come from rabita.no, which turned out to carry a
         great deal that our own copy never had — the whole nikah sequence
         through Skatteetaten, the counselling page's own four headings, the
         hajj office and its number.

         SERVICE_STORY, the second photograph, moves down to section 3. The
         mockup has no picture here, and the enquiry rail had ~150px of
         empty green under the address for it to fill. */}
      {/* ── THE ARCADE BEHIND BOTH SECTIONS ────────────────────────────
         Client, 2026-09-16: "also use this image in bg and make it still but
         let section move for these 2 sections ... as it looks so basic now".

         The same still photograph the two index pages stand on, so a subject
         page is visibly part of the set it was reached from rather than a
         plain white page at the end of a click. Sections 2 and 3 each host
         their own, which keeps the tone step between them — paper-2 for the
         offer, paper for the enquiry — doing the work of separating them.

         WHAT WENT: a gold radial bloom and a .star-texture tile. Both were
         standing in for a photograph, and with a real one behind them they
         were three decorations competing on one ground.

         HALL_HOST, not the old `overflow-hidden`. `hidden` makes the section
         a scroll container and a sticky child pins to it instead of the page,
         so the image would simply not move. See components/hall-backdrop.tsx.

         wash 62, against the index pages' 45: those sit under dark photo
         plates that read over anything, while this is ink on paper at body
         size, and an arcade behind a paragraph is a legibility problem
         rather than a mood. */}
      <div className={HALL_HOST}>
        {/* ONE backdrop for BOTH sections, not one each.
           Measured: section 2 is 600px and section 3 is 833px, against a
           902px viewport — and a `sticky` child taller than its container has
           ZERO travel, so per-section backdrops could never stick. They
           scrolled 1:1 with the page, which is the opposite of what was
           asked. Spanning both gives the container 1433px and the image about
           530px of travel, which is a real parallax.

           The cost is the tone step between the two sections: they are
           `tone="none"` now so the one photograph shows through both. The
           separation comes from the enquiry's own faint wash below instead,
           and the form card is opaque bg-paper, so it still reads as a card
           standing on something. */}
        <HallBackdrop wash={62} />
      {/* ── SPACING AFTER A HEADER WITH NO PICTURE ────────────────────
         Client, 2026-09-18: "move the bottom sections a bit up with modern
         spacing, since when image gone, there would be too much space."

         He is right, and it is not simply that the header got shorter. The
         PageBand ends on a hard dusk edge, so the 60px under it reads as the
         gap BETWEEN two objects. The pilot header is type on paper and this
         section is type on paper, so the same 60px, stacked on the header's
         own bottom rhythm, reads as a hole in one continuous page. Same
         measurement, different job.

         36/56 instead of 60/60, on every service since the header rollout
         (client approved the pilot 2026-09-18).

         `!pt-*` because lib/cn is plain clsx with no tailwind-merge: the
         Section's own `py-section-md` stays in the class list either way, and
         without the important flag which one wins is down to stylesheet
         order. */}
      <Section tone="none" className="!pt-9 md:!pt-14 [@media(min-width:768px)_and_(max-height:900px)]:!pt-7">
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-12 md:gap-12 lg:gap-16">
            {/* self-center, the same call section 3 used to make and for the
               same reason: the photo column is taller than the type, so the
               text sat at the top of a stretched cell with ~160px of slack
               dumped underneath it. */}
            <div className={cn(story ? 'md:col-span-5' : 'md:col-span-8', 'md:self-center')}>
              {/* Eyebrow draws its own 28px rule before the text
                 (.eyebrow-bar::before, globals.css) — the mockup's eyebrow,
                 already in the design system. `detail.what` is reused rather
                 than a new per-service string, and it no longer echoes the
                 heading below it, because the heading is now the service's
                 own offerTitle. */}
              <Eyebrow tone="gold-deep">{t('detail.what')}</Eyebrow>
              <SectionHeading className="mt-5">{t(`items.${s}.offerTitle`)}</SectionHeading>
              <p className="mt-6 max-w-[38ch] text-body text-ink-60">{t(`items.${s}.offerLede`)}</p>

              {/* The foot of the column. Rabita's own mark, not a drawn
                 per-service glyph (client, 2026-09-06). */}
              <div className="mt-10 flex items-center gap-5">
                <Image
                  src="/logo/rabita-mark-256.png"
                  alt=""
                  width={40}
                  height={40}
                  aria-hidden
                  className="h-10 w-10 shrink-0 opacity-70"
                />
                <span aria-hidden className="h-px flex-1 bg-gold-deep/30" />
              </div>
            </div>

            {/* ── THE PHOTOGRAPH, WHERE THE 01-04 LIST USED TO BE ────────
               Client, 2026-09-15: "in this section we remove the bullts and
               add image there, very modern".

               The photograph is SERVICE_STORY — the same frame that used to
               sit at the foot of section 3's rail, which this same round of
               changes removes. So the page loses a column and gains a plate
               without needing a single new asset.

               PLATE, NOT A FULL-WIDTH BLEED. The full-bleed version of this
               treatment shipped on the spread prototype earlier today and
               the client's verdict was "very cheap its looking". Two reasons
               it fails, both measured: this site frames every other
               photograph it has (rounded-3xl on a tinted ground, no shadow),
               so a bleed reads as foreign; and these are phone photographs,
               which at full width run near 1:1 and show every defect.

               The ratio is MEASURED, not assumed. SERVICE_STORY is mixed —
               bazaar-stand is 1125x1500 portrait while prayer-congregation
               is 1312x736 landscape — so a single locked frame would crop
               roughly half of one group away. galleryOrientation reads the
               real file dimensions. */}
            {/* Centred on a phone, pushed to the OUTER edge from md up.
               Start-aligned, a portrait plate sat hard against the text and
               read as crowding the middle of the page (client, 2026-09-15:
               "image too much in centre on desktop, move it a bit to right
               when vertical"). End-aligned, the portrait and the landscape
               plates share one right edge with the band above them, so the
               page keeps a single outer margin instead of two.

               justify, not auto margins: `mx-auto` is a physical property and
               `me-0`/`ms-auto` are logical ones, so mixing them leaves the
               winner to stylesheet order rather than intent. justify-end also
               mirrors correctly in Arabic for free. */}
            {story && (
            <div className="flex justify-center md:col-span-7 md:justify-end">
              <figure
                className={cn(
                  'relative w-full',
                  storyOrientation === 'portrait' ? 'max-w-[24rem]' : 'max-w-none',
                )}
              >
                {/* The ghost card — this site's own way of giving a flat
                   photograph depth WITHOUT a drop shadow (service-index.tsx
                   says exactly that). Only 2 of the 32 shadows in this
                   codebase touch a photograph. */}
                {/* Wrapped around the PLATE only. inset-0 on the figure made
                   the outline enclose the caption too, which read as a box
                   drawn round a picture and its label rather than as a
                   second plate behind the first. */}
                <div className="relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 rounded-3xl border border-gold-deep/25 md:translate-x-3 md:translate-y-3"
                />
                <div
                  className={cn(
                    'relative w-full overflow-hidden rounded-3xl bg-paper-deep ring-1 ring-inset ring-ink/10',
                    storyOrientation === 'portrait' ? 'aspect-[4/5]' : 'aspect-[4/3]',
                  )}
                >
                  <Image
                    src={story.src}
                    alt={plainTitle}
                    fill
                    sizes="(min-width: 768px) 58vw, 100vw"
                    className="object-cover"
                    // The site's grade with a touch of grayscale, matching
                    // the spread: these are phone photographs shot on
                    // different days, and a little desaturation pulls them
                    // into one set. No brightness cut — the client had that
                    // taken off the gift photos on 2026-09-15 for reading
                    // too dark.
                    style={{ filter: 'grayscale(0.15) saturate(0.9) contrast(1.06)' }}
                  />
                </div>
                </div>
                {/* NO CAPTION HERE, deliberately.
                   It said "Fotografier fra Rabita", which is false on this
                   page: SERVICE_STORY is a mixed bag, and several entries
                   are CGI renders of the planned building rather than
                   photographs — svc-prayer, used by nikah, is a render of
                   the mihrab (synthetic light, texture-mapped marble, no
                   camera noise). Captioning a render as a photograph is a
                   claim the site should not make.

                   Crediting them as renders is also out: the client had the
                   architect credit removed on 2026-09-15. So the plate
                   stands uncaptioned, which costs nothing — the ghost
                   outline and the frame already say "considered".

                   The caption DOES stay on the id-for-alle spread, where all
                   four frames are genuinely Rabita's own event photographs. */}
              </figure>
            </div>
            )}
          </div>
        </SectionBody>
      </Section>

      {/* ── 3. Asking for it ───────────────────────────────────────────────
         The form, on the site's white (client, 2026-09-06).

         It has been on a dusk plate and then on the pale green. The green
         made the two halves of the page too alike in weight — "there should
         be difference, second section is also same" — so the description
         keeps the warm paper-2 and the enquiry steps UP to paper, which is
         the lightest tone on the site. No gradient between them any more:
         at eight units apart the fade had nothing to soften, and paper-2
         meeting paper is the section rhythm the rest of the site already
         runs on.

         Same opener as section 2 (eyebrow, heading, lede) and the same row
         language: the three ways to reach us are rows with a mono label, a
         serif value and the section-2 seal, so the two halves of the page
         read as one design. */}
      {/* bg-paper/45 rather than an opaque tone: the arcade still shows, but
         this half sits a shade lighter than the offer above it, which is the
         step the two solid tones used to make. */}
      <Section
        id="enquiry"
        tone="none"
        className="scroll-mt-24 bg-paper/45 pb-20 md:pb-28"
      >
        <SectionBody>
          {/* ── THE ENQUIRY, CENTRED, WITH NO RAIL BESIDE IT ───────────────
             Client, 2026-09-15: "we keep the form here, centre it and then
             remove this from left".

             What went: the service eyebrow, the note, the three contact rows
             (e-post / telefon / adresse) and the second photograph. The
             photograph was not thrown away — it is now the plate in section
             2 above.

             WHAT THIS COSTS, so it is on the record: the phone number and
             the address are no longer on this page. Someone who would rather
             ring than fill in a form now has to reach the footer to find the
             number. That is a real loss of utility, and reversible — the
             ContactRow markup is in this file's history.

             The heading STAYS, centred above the card. Removing the rail is
             an instruction about the column, not about the section's title:
             a form card floating with no line above it has nothing telling
             you what it is for. */}
          {/* ── THE ENQUIRY, AND THE ARGUMENT FOR JOINING, SIDE BY SIDE ──
             Client, Tjenester list point 5: "Forenkle til kun kontaktskjema +
             CTA «Bli medlem», med begrunnelse for fordelene ved medlemskap".

             The CTA sat in a centred band UNDER the form until 2026-09-16,
             which is where a second thought goes — past the Send button, at
             the very bottom of the page, read by nobody who has just
             submitted. Beside the form it becomes an aside rather than an
             afterthought: the reader meets the argument while they are still
             deciding, not after they have finished.

             A hairline on the aside's start edge and nothing else — no card,
             no fill, no shadow. The form is already a raised card on this
             white ground, and a second card beside it would make the section
             read as two competing offers instead of one request with a note
             in the margin. The rule is the site's own device for exactly
             this, and it is logical (border-s / ps) so Arabic mirrors it. */}
          {/* The opener sits ABOVE the grid, not inside the form column.
             Inside it, `self-center` on the aside centred against the whole
             column — eyebrow, heading AND form — which put the aside's middle
             well above the form card's. Lifted out, the heading introduces
             the section and the two columns below it are the form and the
             aside alone, so centring means what it says. */}
          <Eyebrow tone="gold-deep">{plainTitle}</Eyebrow>
          <SectionHeading className="mt-5">{t('detail.request')}</SectionHeading>

          <div className="mt-10 md:grid md:grid-cols-12 md:items-center md:gap-12 lg:gap-16">
            <div className="md:col-span-7">
              <RequestForm subject={s as RequestSubject} card rule={false} />
            </div>

            {/* self-center: the aside is far shorter than the form, and left
               to stretch it sat at the top of the cell with all the slack
               dumped beneath it. Centred, it reads as deliberately placed
               against the middle of the form — which is what was asked for. */}
            {/* ── WHY JOIN ─────────────────────────────────────────────
               Client, Tjenester list point 5: the CTA wants "begrunnelse for
               fordelene ved medlemskap" — the BENEFITS.

               This first shipped with membership.headline and membership.body,
               and the client was right to reject it (2026-09-16: "this text
               isnt right"). That copy is the HOMEPAGE argument — the annual
               meeting elects the board, the board decides what the seven
               floors are used for — which is governance, not benefits, and
               is a strange thing to read when you have come to ask about a
               funeral. It also misses what was asked for.

               What is here instead is /bli-medlem's own copy, which was
               already written in all three locales and is about exactly this:
               being counted, the newsletter, invitations, a vote if you want
               one, and that it renews yearly. The aside now previews the page
               its button leads to, which is what an aside beside a form
               should do.

               ── TWO THINGS DELIBERATELY LEFT OUT ────────────────────────
               The PRICE. "1 000 kr i året" is only true of the voting tier —
               medlemskapPage says children's and youth membership is free —
               so a single figure here would be a half-truth on eighteen
               pages. The linked page sets out the tiers properly.

               The MEMBER COUNT. joinPage.members says "over 4 300" while
               lib/membership.ts says totalMembers: 4200, and that figure is
               what the rest of the site prints. The site contradicts itself
               by a hundred members; printing either number on every service
               page would spread the contradiction rather than settle it.
               Raised with the client 2026-09-16. */}
            <aside className="mt-12 md:col-span-5 md:mt-0 md:border-s md:border-rule md:ps-10 lg:ps-14">
              <Eyebrow tone="gold-deep">{tmp('eyebrow')}</Eyebrow>

              <h2 className="mt-5 max-w-[24ch] font-serif text-[clamp(1.3rem,1.9vw,1.55rem)] leading-[1.18] text-balance text-ink">
                {tj('headline')}
              </h2>

              {/* The benefits, ruled — TITLES ONLY (client, 2026-09-16:
                 "keep this very short for CTA text"). Each point's body ran
                 two more lines underneath and took the aside to 477px beside
                 a 518px form, which is not an aside any more, it is a second
                 column of prose competing with the enquiry. The three titles
                 already name the three benefits; the page the button leads to
                 carries the detail. joinPage.points.*.body is untouched in the
                 message files and still renders on /bli-medlem. */}
              <ul className="mt-6 border-t border-rule">
                {(['updates', 'vote', 'renewal'] as const).map((k) => (
                  <li
                    key={k}
                    className="border-b border-rule py-3 text-[14px] leading-snug text-ink"
                  >
                    {tj(`points.${k}.title`)}
                  </li>
                ))}
              </ul>

              {/* "Bli medlem", which is the label the client actually asked
                 for. It said "Få stemmerett" until 2026-09-16 — the voting
                 tier's own CTA, narrower than this block now is. */}
              <Link
                href={`/${locale}/bli-medlem`}
                // Fills GOLD on hover, the same accent the Send button opposite
                // it is filled with (client, 2026-09-16). The resting state
                // keeps its ink hairline: an outline button already wearing
                // the accent would compete with the filled one for primacy,
                // and the enquiry is what this section is for.
                className="group mt-7 inline-flex min-h-11 items-center gap-2 rounded-full border border-ink px-6 text-[14px] font-semibold text-ink transition-colors hover:border-gold-deep hover:bg-gold-deep hover:text-paper"
              >
                {tm('join')}
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            </aside>
          </div>
        </SectionBody>
      </Section>
      </div>
      {/* The "Coming in person" band (ServiceVisit) was removed on 2026-08-31:
         it repeated verbatim on this page, the services index and all eleven
         subject pages, so the address stopped registering as information and
         started reading as furniture. It survives on /besok-oss, which is the
         page that exists to answer it. The component is left in
         components/service-page.tsx, unused, so it can go back with one line. */}
    </main>
  );
}
