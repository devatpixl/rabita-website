import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { formatAmount } from '@/lib/format';
import { isFull, upcomingEvents, type EventRecord } from '@/lib/events';
import type { AppLocale } from '@/i18n/routing';
import { Eyebrow, Section, SectionBody, SectionHeading } from './primitives';
import { RsvpButton } from './rsvp-button';

// Events are a schedule with open seats, not a blog feed. The next
// event gets real weight — date, capacity bar, primary CTA — and the
// rest fall through as a dated list. No cards, no images: the point of
// the section is the RSVP capture, and every future campaign is
// cheaper if the contact list grows here.

export async function EventsSchedule() {
  const t = await getTranslations('events');
  const locale = (await getLocale()) as AppLocale;

  const events = upcomingEvents();
  if (events.length === 0) {
    return (
      <Section id="arrangementer" tone="paper">
        <SectionBody>
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <SectionHeading className="mt-3">{t('heading')}</SectionHeading>
          <p className="mt-6 max-w-prose text-body text-ink-60">
            {t('emptyState')}
          </p>
        </SectionBody>
      </Section>
    );
  }

  const [featured, ...rest] = events;

  return (
    <Section id="arrangementer" tone="paper">
      <SectionBody>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>{t('eyebrow')}</Eyebrow>
            <SectionHeading className="mt-3">{t('heading')}</SectionHeading>
          </div>
        </div>

        <FeaturedEvent event={featured} locale={locale} />

        {rest.length > 0 && (
          <ul className="mt-14">
            {rest.map((e) => (
              <li key={e.slug}>
                <EventRow event={e} locale={locale} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10">
          <Link
            href={`/${locale}/arrangementer`}
            className="inline-flex min-h-12 items-center rounded-btn border border-ink px-5 py-3 text-body font-semibold text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            {t('all')}
          </Link>
        </div>
      </SectionBody>
    </Section>
  );
}

async function FeaturedEvent({ event, locale }: { event: EventRecord; locale: AppLocale }) {
  const t = await getTranslations('events');
  const { dayMonth, year, dateLabel } = formatEventDate(locale, event);
  const full = isFull(event);
  const detail = {
    slug: event.slug,
    title: t(`items.${event.titleKey}.title`),
    dateLabel,
  };

  return (
    <div className="grid grid-cols-1 items-start gap-8 border-y border-rule py-10 md:grid-cols-[auto_1fr]">
      <div className="min-w-[9rem]">
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-gold-deep">
          {t('featuredLabel')}
        </p>
        <p className="mt-3 font-serif text-[clamp(2rem,4vw,2.75rem)] leading-[1.05] text-ink tabular-nums">
          {dayMonth}
          <br />
          {year}
        </p>
        <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-60">
          {t('timeAt', { time: event.time, venue: event.location })}
        </p>
      </div>

      <div>
        <h3 className="font-serif text-[clamp(1.35rem,2.4vw,1.65rem)] leading-tight text-ink">
          {t(`items.${event.titleKey}.title`)}
        </h3>
        <p className="mt-3 max-w-prose text-body text-ink-60">
          {t(`items.${event.titleKey}.body`)}
        </p>

        {event.capacity !== null && (
          <CapacityBar rsvpCount={event.rsvpCount} capacity={event.capacity} locale={locale} full={full} />
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <RsvpButton
            event={detail}
            label={full ? t('waitlist') : t('cta')}
            variant={full ? 'ghost' : 'primary'}
          />
        </div>
      </div>
    </div>
  );
}

async function CapacityBar({
  rsvpCount,
  capacity,
  locale,
  full,
}: {
  rsvpCount: number;
  capacity: number;
  locale: AppLocale;
  full: boolean;
}) {
  const t = await getTranslations('events');
  const pct = Math.min(100, Math.max(0, Math.round((rsvpCount / capacity) * 100)));
  const nStr = formatAmount(locale, rsvpCount);
  const totalStr = formatAmount(locale, capacity);

  return (
    <div className="mt-5 max-w-md">
      <p className="mb-2 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-60 tabular-nums">
        {t('capacity', { n: nStr, total: totalStr })}
      </p>
      <div
        role="progressbar"
        aria-valuenow={rsvpCount}
        aria-valuemin={0}
        aria-valuemax={capacity}
        className="h-[3px] w-full overflow-hidden bg-rule"
      >
        <div
          className={full ? 'h-full bg-ink/40' : 'h-full bg-gold'}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

async function EventRow({ event, locale }: { event: EventRecord; locale: AppLocale }) {
  const t = await getTranslations('events');
  const { shortDate, dateLabel } = formatEventDate(locale, event);
  const full = isFull(event);
  const detail = {
    slug: event.slug,
    title: t(`items.${event.titleKey}.title`),
    dateLabel,
  };

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-baseline gap-6 border-t border-rule py-6">
      <p className="font-mono text-[13px] uppercase tracking-[0.12em] text-ink tabular-nums whitespace-nowrap">
        {shortDate}
      </p>
      <div className="min-w-0">
        <h4 className="font-serif text-[17px] text-ink">
          {t(`items.${event.titleKey}.title`)}
        </h4>
        <p className="mt-1 text-[14px] text-ink-60">
          {t(`items.${event.titleKey}.body`)}
        </p>
      </div>
      <RsvpButton
        event={detail}
        label={full ? t('waitlist') : t('cta')}
        variant="link"
      />
    </div>
  );
}

function formatEventDate(locale: AppLocale, event: EventRecord) {
  const tag = locale === 'en' ? 'en-GB' : locale === 'ar' ? 'ar-EG' : 'nb-NO';
  const date = new Date(event.date);
  const dayMonth = new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long' }).format(date);
  const year = new Intl.DateTimeFormat(tag, { year: 'numeric' }).format(date);
  const shortDate = new Intl.DateTimeFormat(tag, { day: '2-digit', month: 'short' })
    .format(date)
    .replace(/\./g, '')
    .toUpperCase();
  const dateLabel = `${dayMonth} ${year} · ${event.time}`;
  return { dayMonth, year, shortDate, dateLabel };
}
