import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function LocaleNotFound() {
  const t = await getTranslations('notFound');
  return (
    <main className="shell flex min-h-[60vh] max-w-3xl flex-col justify-center py-24">
      <p className="text-[13px] text-gold">404</p>
      <h1 className="mt-3 font-serif text-display text-ink">{t('title')}</h1>
      <p className="mt-4 text-body text-ink-60">{t('body')}</p>
      <div className="mt-8">
        <Link href="/no" className="min-h-11 inline-block rounded-btn bg-ink px-4 py-2 text-body font-semibold text-paper">
          {t('back')}
        </Link>
      </div>
    </main>
  );
}
