import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['no', 'en', 'ar'] as const,
  defaultLocale: 'no',
  localePrefix: 'always',
});

export type AppLocale = (typeof routing.locales)[number];
