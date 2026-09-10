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
      // Children-and-youth came off the site on 2026-09-05 and came back on
      // 2026-09-10 under a different slug: the copy the client supplied is
      // "Barn- og familieaktiviteter", not children-and-youth, so the old
      // link now has a successor to point at rather than the index.
      {
        source: '/:locale(no|en|ar)/tjenester/barn-og-ungdom',
        destination: '/:locale/tjenester/barn-og-familie',
        permanent: true,
      },
      // /undervisning was the teaching landing page from before any teaching
      // service had one of its own. By 2026-09-10 the four programmes it
      // described — arabisk, koran, ungdom, kalligrafi — were four service
      // pages, plus norsk, all listed directly above it in the same menu. It
      // was the only page on the site using its own template, reached by one
      // link, and its "Undervisning" menu entry collided with the group
      // heading of the same name on the index. Its enrolment copy moved to
      // /tjenester/skole; the page itself lands on the index (client).
      {
        source: '/:locale(no|en|ar)/undervisning',
        destination: '/:locale/tjenester',
        permanent: true,
      },
      // The veivisere redirect is GONE, not edited: /tjenester/veivisere is
      // a real page again, and a redirect on that source would have shadowed
      // it — the rule runs before routing, so the page would have been
      // unreachable at its own address.
    ];
  },
};

export default withNextIntl(nextConfig);
