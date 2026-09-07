import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // Where the build output goes. Default `.next`, overridable per command.
  //
  // `next build` and `next dev` share `.next` and fight over it: a build run
  // while the dev server is up leaves dev serving half-written chunks, and
  // the symptom is "Cannot find module './vendor-chunks/motion.js'" and a
  // 500 on a page that was fine a second earlier. The workaround was to kill
  // dev before every build and remember to start it again — which is exactly
  // how the server kept ending up dead.
  //
  //   npm run dev                     -> .next
  //   NEXT_DIST_DIR=.next-build next build -> .next-build
  //
  // Two directories, no collision, and dev never has to be stopped again.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      // Mediation was merged into counselling on 2026-08-31 (client): one
      // card, "Samtaler og megling", carrying both descriptions. The copy
      // for `megling` was removed with it, so the route was still building
      // but printing raw message keys as its headline. Links to it exist in
      // the wild, so it redirects rather than 404s.
      {
        source: '/:locale(no|en|ar)/tjenester/megling',
        destination: '/:locale/tjenester/counselling',
        permanent: true,
      },
      // Children-and-youth and the school-visit programme came off the
      // services index on 2026-08-31 and off the site on 2026-09-05
      // (client: keep pages only for the eight the index lists). Neither
      // has a single successor page the way megling had counselling, so
      // both land on the index, which is where someone following an old
      // link can see what does exist.
      {
        source: '/:locale(no|en|ar)/tjenester/barn-og-ungdom',
        destination: '/:locale/tjenester',
        permanent: true,
      },
      {
        source: '/:locale(no|en|ar)/tjenester/veivisere',
        destination: '/:locale/tjenester',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
