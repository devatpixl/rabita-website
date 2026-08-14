import { getRequestConfig } from 'next-intl/server';
import { routing, type AppLocale } from './routing';

function isSupported(x: string | undefined): x is AppLocale {
  return !!x && (routing.locales as readonly string[]).includes(x);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isSupported(requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
