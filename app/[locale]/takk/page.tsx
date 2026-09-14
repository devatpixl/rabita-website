import Image from 'next/image';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { formatAmount } from '@/lib/format';
import { AnimatedProgress } from '@/components/animated-progress';
import { SectionBody } from '@/components/primitives';
import { Accent } from '@/components/accent';
import type { AppLocale } from '@/i18n/routing';

// The site's own thank-you page, rebuilt 2026-09-14 ("make this page modern
// and better"). What it was: a left-aligned column of paragraphs, with the
// campaign total set as a bare "26 995 179 kr / 100 000 000 kr" line and the
// certificate reduced to a button among buttons.
//
// The page has one job and it is not informational — it is the only moment
// where someone who has just given is looking straight at us. So it is built
// as three beats rather than a stack of text:
//
//   1. the acknowledgement, on the arch, with the seal
//   2. what their gift joined — the total as a real meter, not a fraction
//   3. the certificate as an OBJECT, and the ask to share
//
// Everything it said before it still says. Nothing was cut to make it look
// calmer; the same four strings are placed rather than listed.

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as AppLocale;
  const t = await getTranslations({ locale, namespace: 'thanks' });
  const tc = await getTranslations({ locale, namespace: 'certificate' });
  const tm = await getTranslations({ locale, namespace: 'meter' });

  const raised = formatAmount(l, CAMPAIGN.raisedNok);
  const goal = formatAmount(l, CAMPAIGN.goalNok);
  const percent = Math.min(100, (CAMPAIGN.raisedNok / CAMPAIGN.goalNok) * 100);
  const percentLabel = new Intl.NumberFormat(
    l === 'ar' ? 'ar-EG' : l === 'en' ? 'en-GB' : 'nb-NO',
    { maximumFractionDigits: 1 },
  ).format(percent);

  return (
    <main className="bg-paper">
      {/* ── 1. the acknowledgement ──────────────────────────────────────
         The arch behind it. Same device as the visit page and the About
         figures — top radius, gold hairline, masked away at the foot so the
         shape has no bottom edge to end on — but NOT the same photograph, and
         the difference matters.

         Those two pages sit the arch BEHIND A CARD, so only a sliver of it is
         ever visible at the margin. arch-light.jpg is 525x350, and at that
         size nobody can tell. Here the right half of the hero is open paper
         with nothing in front of it, so the whole thing is exposed: Next was
         painting a 335x223 bitmap into a 336x544 box, object-cover scaling it
         2.44x and keeping the middle 41% of its width. That is the mush the
         client saw and called broken.

         takk-arch.webp is cut for this box — 672x880, exactly 2x, from the
         2800px mihrab render. Cutting a portrait asset rather than pointing
         at zoom-mihrab.webp directly is the whole fix: sizes is a WIDTH, so a
         landscape source in a portrait box gets served on its width (640w) and
         then cover-scales UP on its height. Same bug in a new costume. A
         portrait file makes sizes="336px" mean what it says.

         And it earns its opacity now. A thank-you page is the one moment
         someone who has just given is looking straight at us, so the right
         thing to show them is the room they just paid for — the mihrab, the
         carved screen, the congregation — not a 40% stain of a corridor.

         GEOMETRY IS LOAD-BEARING, both edges. It was -top-20, which put the
         entire rounded crown UNDER the sticky header — the one feature that
         makes an arch an arch, hidden, leaving a plain rectangle on screen.
         inset-y-6 clears the header by 24px.

         THE HEIGHT IS DERIVED, NOT SET, and that is deliberate. A fixed height
         has to be guessed against a section whose height depends on how the
         headline wraps — and it wraps differently per language. 27.5rem fit
         Norwegian and English (two lines) and overran Arabic (one line, so a
         65px shorter section) by enough that overflow-hidden cut the arch
         mid-fade: a hard edge, in Arabic only, invisible from an English
         screen. Pinning top and bottom instead means the fade always reaches
         zero before the clip, in any language, at any copy length. Do not put
         a fixed height back on this.

         xl, not lg. The other two pages show their arch from lg because a card
         covers it there; this one is exposed, so it needs real room. Measured
         at 1024 and 1152 the headline runs into it (h1 ends at 760, arch
         starts at 596), and at 1024 the section is short enough that the foot
         overruns by 48px and overflow-hidden cuts it mid-fade — the same hard
         edge, back again. 1280 is the first width where neither happens. */}
      <section className="relative isolate overflow-hidden bg-paper-2 pb-section-md pt-16 md:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute top-6 bottom-10 end-[8%] -z-10 hidden w-[21rem] overflow-hidden rounded-t-[10rem] border border-gold-deep/25 xl:block"
          style={{
            maskImage:
              'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 46%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage:
              'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 46%, rgba(0,0,0,0) 100%)',
          }}
        >
          <Image
            src="/photos/takk-arch.webp"
            alt=""
            fill
            sizes="336px"
            loading="eager"
            // object-position X only. The asset is cut to this box's ratio, so
            // cover crops nothing on either axis — a Y value here would read
            // as control that does not exist.
            className="object-cover opacity-[0.85]"
            style={{ filter: 'saturate(0.72) sepia(0.12) contrast(1.02) brightness(1.03)' }}
          />
          {/* Seats the render in the paper palette without draining it. */}
          <span aria-hidden className="absolute inset-0 bg-paper-2/15" />
        </div>

        <SectionBody className="relative">
          <div className="max-w-[46rem]">
            {/* The mark. A gift acknowledged deserves a seal on it rather
               than a line of small text announcing itself. */}
            <Image
              src="/logo/rabita-mark-256.png"
              alt=""
              width={56}
              height={56}
              aria-hidden
              className="h-14 w-14"
            />
            <p className="mt-7 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
              {t('eyebrow')}
            </p>
            <h1 className="mt-4 font-serif text-display leading-[1.02] text-balance text-ink">
              {t.rich('headlineRich', {
                em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
              })}
            </h1>
            <p className="mt-6 max-w-[52ch] text-body leading-relaxed text-ink-60">
              {t('receipt')}
            </p>
          </div>
        </SectionBody>
      </section>

      {/* ── 2. what the gift joined ─────────────────────────────────────
         The total was a bare fraction on one line, which is a number a reader
         has to do arithmetic on. As a meter it answers the only question a
         new giver actually has: how far along is this. */}
      <SectionBody className="py-section-md">
        <div className="grid gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-5">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
              {tm('label')}
            </p>
            <p className="mt-4 font-serif text-[clamp(2rem,4vw,2.9rem)] leading-none tabular-nums text-ink">
              {raised}{' '}
              <span className="font-sans text-[0.4em] uppercase tracking-[0.12em] text-ink-60">
                kr
              </span>
            </p>
            <p className="mt-3 font-mono text-[0.75rem] tabular-nums text-ink-60">
              {percentLabel}% {tm('financed')} · {tm('of')} {goal} kr
            </p>
          </div>

          <div className="md:col-span-7 md:self-end">
            <AnimatedProgress
              percent={percent}
              className="h-[3px] w-full overflow-hidden rounded-full bg-ink/10"
              fillClassName="h-full rounded-full bg-gold-deep"
            />
            {/* The milestone reads as the next thing to happen, which is what
               it is — so it sits under the bar it is the next mark on. */}
            <p className="mt-6 max-w-[54ch] border-s-2 border-gold-deep/40 ps-5 text-body leading-relaxed text-ink-60">
              {t('nextMilestone')}
            </p>
          </div>
        </div>
      </SectionBody>

      {/* ── 3. the certificate, and the ask ─────────────────────────────── */}
      <section className="bg-paper-2 py-section-md">
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-12 md:gap-14">
            {/* The certificate as an object you can see the edge of, rather
               than a button whose label you have to trust. A sheet, the gold
               rule, and the words on it — enough that a reader knows what
               opens before they open it.

               target=_blank on purpose: the reader has just finished a flow,
               and replacing this page with a document would make "back" the
               only way out of it. It carries no donor data in the URL — the
               certificate falls back to its specimen values. When payments
               are real this becomes a signed reference the server looks up,
               never the name and amount in a query string. */}
            <a
              href={`/${locale}/takk/attest`}
              target="_blank"
              rel="noreferrer"
              className="group relative block overflow-hidden rounded-2xl border border-rule bg-paper p-7 transition-[border-color,box-shadow] duration-300 hover:border-gold-deep/50 hover:shadow-[0_1px_2px_rgba(26,26,24,0.04),0_24px_60px_-38px_rgba(26,26,24,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep/50 md:col-span-5"
            >
              <span aria-hidden className="block h-px w-10 bg-gold-deep/40" />
              <span className="mt-5 block font-mono text-[0.625rem] uppercase tracking-[0.16em] text-gold-deep">
                {tc('eyebrow')}
              </span>
              <span className="mt-2 block font-serif text-[1.5rem] leading-tight text-ink">
                {tc('heading')}
              </span>
              <span className="mt-5 inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold-deep">
                {tc('open')}
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                >
                  &rarr;
                </span>
              </span>
              {/* The sheet's own corner, ghosted in — the object reads as
                 paper rather than as a panel. */}
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-10 -end-8 h-28 w-28 rotate-12 rounded-lg border border-gold-deep/15 bg-paper-2/60"
              />
            </a>

            <div className="md:col-span-7 md:self-center">
              <p className="max-w-[46ch] text-body leading-relaxed text-ink">
                {t('sharePrompt')}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  className="inline-flex min-h-11 items-center rounded-full border border-ink px-5 text-body font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
                  href="https://api.whatsapp.com/send?text=https%3A%2F%2Frabita.no"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('shareWhatsapp')}
                </a>
                <a
                  className="inline-flex min-h-11 items-center rounded-full border border-ink px-5 text-body font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
                  href="mailto:?subject=Rabita&body=https%3A%2F%2Frabita.no"
                >
                  {t('shareEmail')}
                </a>
              </div>
              <Link
                href={`/${locale}`}
                className="group mt-8 inline-flex items-center gap-2 border-b border-ink/25 pb-1 text-body font-semibold text-ink transition-colors hover:border-ink"
              >
                {t('back')}
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            </div>
          </div>
        </SectionBody>
      </section>

      {/* Conversion event stub. Replaces with GA4/Meta Conversions API in phase 2. */}
      <ConversionPing />
    </main>
  );
}

function ConversionPing() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html:
          "try{window.dispatchEvent(new CustomEvent('rabita:donation_complete'));}catch(e){}",
      }}
    />
  );
}
