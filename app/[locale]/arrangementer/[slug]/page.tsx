'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Eyebrow, Section, SectionBody, SectionHeading } from '@/components/primitives';
import { VisitClose } from '@/components/visit-page';
import { PageBand } from '@/components/page-band';
import { Field, VALUE } from '@/components/request-form';
import { FigureIcon, type FigureIconName } from '@/components/figure-icons';
import { EVENT_PAGE_BY_SLUG, EVENT_PAGES } from '@/lib/event-pages';
import { cn } from '@/lib/cn';

type Params = { locale: string; slug: string };

const FACT_ICONS: FigureIconName[] = ['calendar', 'people', 'check'];

export default function EventDetail({ params }: { params: Promise<Params> }) {
  const { slug } = use(params);
  const event = EVENT_PAGE_BY_SLUG[slug] ?? EVENT_PAGES[0];
  const key = event.key;

  const t = useTranslations('eventsPage');
  const tv = useTranslations('visitPages');
  const tf = useTranslations('requestForm');
  const te = useTranslations('events');
  const locale = useLocale();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [count, setCount] = useState(1);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fmt = new Intl.DateTimeFormat(
    locale === 'en' ? 'en-GB' : locale === 'ar' ? 'ar-EG' : 'nb-NO',
    { day: 'numeric', month: 'long', year: 'numeric' },
  );
  const facts = tv.raw('pages.events.facts') as { term: string; detail: string }[];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFailed(false);
    try {
      // The response was previously neither awaited for status nor guarded
      // by a catch, so a rejected or 500'd RSVP still rendered the "you are
      // signed up" screen. Same defect that was fixed in request-form.tsx;
      // this was the last copy of it.
      const res = await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug, name, email, count }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setDone(true);
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      {/* The band, as on the index and on /besok-oss. This page opened on
         VisitHero — a bare crumb, a naked 21:9 photograph, and the event's
         name only underneath it. */}
      <PageBand
        kicker={tv('crumb')}
        kickerNote={tv('pages.events.eyebrow')}
        title={t(`items.${key}.title`)}
        lede={t(`items.${key}.body`)}
        image={event.image}
        alt={t(`items.${key}.title`)}
        layout="over"
        mark="rosette"
        tone="warm"
        padBottom="none"
      >
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] tabular-nums text-ink-60">
          <bdi dir="ltr">{fmt.format(new Date(event.date))}</bdi>
        </p>
      </PageBand>

      <Section tone="paper-2" className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 end-[4%] -z-10 h-[34rem] w-[34rem] rounded-full bg-gold/[0.06] blur-3xl"
        />
        <div
          aria-hidden
          className="star-texture star-texture--light pointer-events-none absolute inset-0 -z-10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-paper to-paper-2 md:h-40"
        />
        <SectionBody>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
            {/* ── the event ──────────────────────────────────────────── */}
            <div className="lg:col-span-5 xl:col-span-4">
              {/* The date is the headline, the way the address is on
                 /besok-oss: nobody needs a heading that says "date" over a
                 date. */}
              <p className="inline-flex items-center rounded-full bg-paper px-3.5 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-60 ring-1 ring-ink/10">
                {tv('pages.events.eyebrow')}
              </p>
              <SectionHeading className="mt-5">
                <bdi dir="ltr">{fmt.format(new Date(event.date))}</bdi>
              </SectionHeading>

              <ul className="mt-8 grid gap-x-8 gap-y-6 border-t border-ink/10 pt-7 sm:grid-cols-2 lg:grid-cols-1">
                {facts.map((f, i) => (
                  <li key={f.term} className="flex items-start gap-3.5">
                    <span
                      aria-hidden
                      className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-soft/40 text-gold-deep ring-1 ring-gold-deep/20"
                    >
                      <FigureIcon name={FACT_ICONS[i] ?? 'calendar'} className="h-[18px] w-[18px]" />
                    </span>
                    <span className="block min-w-0">
                      <span className="block font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-60">
                        {f.term}
                      </span>
                      <span className="mt-1 block text-[15px] leading-snug text-ink">{f.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/${locale}/arrangementer`}
                className="group mt-9 inline-flex min-h-11 items-center gap-3 border-t border-ink/15 pt-6 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink transition-colors hover:text-gold-deep"
              >
                {/* "Alle arrangementer", not the section's own eyebrow — the
                   first draft labelled this link with the same word as the
                   chip directly above it, which reads as a link back to the
                   thing you are already looking at. */}
                {te('all')}
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            </div>

            {/* ── the RSVP ───────────────────────────────────────────── */}
            {/* Raised paper card with sunken wells, built from request-form's
               own Field so the two asks on this site are one control and not
               two dialects. The inputs here used to be bare
               `border border-rule` boxes — the shape the client rejected on
               the enquiry form back in September. self-center matches
               /besok-oss and /om-oss. */}
            <div className="lg:col-span-7 lg:self-center xl:col-span-6">
              <div className="rounded-[1.5rem] bg-paper p-6 shadow-[0_1px_2px_rgba(26,26,24,0.04),0_24px_60px_-34px_rgba(26,26,24,0.28)] ring-1 ring-ink/5 sm:p-8">
                {done ? (
                  <div>
                    <Eyebrow tone="gold-deep">{tv('pages.events.eyebrow')}</Eyebrow>
                    <h2 className="mt-4 font-serif text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-balance text-ink">
                      {t('doneTitle')}
                    </h2>
                    <p className="mt-3 max-w-[44ch] text-[15px] leading-snug text-ink-60">
                      {t('doneBody')}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} noValidate={false}>
                    <div className="mb-7">
                      <Eyebrow tone="gold-deep">{t('rsvp')}</Eyebrow>
                      <h2 className="mt-4 font-serif text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-balance text-ink">
                        {t(`items.${key}.title`)}
                      </h2>
                      <p className="mt-3 max-w-[44ch] text-[15px] leading-snug text-ink-60">
                        {t(`items.${key}.body`)}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="rsvp-name" label={t('name')} icon="person" tone="paper" card>
                        <input
                          id="rsvp-name"
                          required
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={cn(VALUE, 'text-ink caret-gold-deep placeholder:text-ink-40')}
                        />
                      </Field>
                      <Field id="rsvp-email" label={t('email')} icon="mail" tone="paper" card>
                        <input
                          id="rsvp-email"
                          required
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={cn(VALUE, 'text-ink caret-gold-deep placeholder:text-ink-40')}
                        />
                      </Field>
                    </div>

                    <div className="mt-4">
                      <Field id="rsvp-count" label={t('count')} tone="paper" card>
                        <input
                          id="rsvp-count"
                          required
                          type="number"
                          min={1}
                          max={20}
                          value={count}
                          onChange={(e) => setCount(Number(e.target.value))}
                          className={cn(VALUE, 'tabular-nums text-ink caret-gold-deep')}
                        />
                      </Field>
                    </div>

                    {failed && (
                      <p
                        role="alert"
                        className="mt-5 rounded-btn border-[1.5px] border-gold-deep/50 bg-gold-soft/40 px-4 py-3 text-[14px] leading-snug text-ink"
                      >
                        {tf('errors.network')}
                      </p>
                    )}

                    <div className="mt-7 flex items-center gap-5">
                      <span aria-hidden className="h-px flex-1 bg-rule" />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition-colors hover:bg-gold-deep disabled:opacity-50"
                      >
                        {submitting ? t('rsvp') : t('rsvp')}
                        <span aria-hidden className="rtl:rotate-180">
                          &rarr;
                        </span>
                      </button>
                      <span aria-hidden className="h-px flex-1 bg-rule" />
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </SectionBody>
      </Section>

      <VisitClose
        heading={tv('pages.events.closeHeading')}
        body={tv('pages.events.closeBody')}
        image="/photos/event-close.webp"
        alt={tv('pages.events.caption')}
        primary={{ label: tv('pages.events.closePrimary'), href: `/${locale}/besok-oss` }}
        secondary={{ label: tv('pages.events.closeSecondary'), href: `/${locale}/kontakt` }}
      />
    </main>
  );
}
