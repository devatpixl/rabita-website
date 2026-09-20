import type { AppLocale } from '@/i18n/routing';

// Video the site can show, declared in one place so every surface that uses
// a film lights up the moment the file lands — no component changes.
export type SiteVideo = {
  /** MP4 (H.264) under /public. */
  src: string;
  /** Still frame shown before play; same folder, .webp. */
  poster: string;
  /** WebVTT subtitle file per locale. Most people watch muted. */
  captions?: Partial<Record<AppLocale, string>>;
  /** Runtime, for the hint on the play button. */
  seconds?: number;
  /**
   * The film's own shape, as a CSS ratio. Defaults to 16/9. The imam's
   * welcome was shot on a phone and is 480x600, so the frame has to be told
   * — a portrait film in a 16:9 box is cropped to a letterbox of the middle
   * of his face.
   */
  aspect?: string;
};

// FILMED. Delivered 2026-08-31 and live: the imam's welcome, 480x600 shot on
// a phone, 38 seconds.
//
// The source was 5.5 MB at ~960 kbps; it ships re-encoded at H.264 crf 24,
// 2.6 MB, which is visually indistinguishable from the original at 3x zoom.
// Nothing downloads until someone presses play — the poster is 17 KB.
//
// STILL MISSING: subtitles. `captions` is empty because there is no
// transcript, and writing one from the audio is not something to guess at in
// three languages. Drop VTT files at public/video/imam-welcome.<locale>.vtt
// and list them here; VideoCard already renders whatever it is given.
export const IMAM_WELCOME: SiteVideo | null = {
  src: '/video/imam-welcome.mp4',
  poster: '/video/imam-welcome-poster.webp',
  seconds: 38,
  aspect: '4 / 5',
};


// Client, Bildeplassering (2026-09-19): "Bønnetider › Video pop opp".
//
// A separate export from IMAM_WELCOME on purpose. His document names THREE
// films — one for Bønnetider, one for Tjenester, one for Undervisning — so
// the page has to choose its own; a single shared constant would put the same
// film in all three the moment the other two arrive.
//
// Delivered as Captions_3FE13E.MP4: 1080x1920, 34s, 65 MB at 15 Mbps, which
// is a phone recording rather than a web asset. Re-encoded H.264 crf 26 at
// 540x960 -> 4.1 MB, an 94% saving. 540 and not 720 because VideoCard
// declares sizes="(min-width: 768px) 34rem" — the card never renders above
// 544px, so anything wider is bytes nobody sees.
//
// STILL MISSING: subtitles, same as the imam's welcome. Most people watch
// muted. Drop VTT files at public/video/bonnetider-film.<locale>.vtt and list
// them under `captions`.
export const PRAYER_POPUP_FILM: SiteVideo | null = {
  src: '/video/bonnetider-film.mp4',
  poster: '/video/bonnetider-film-poster.webp',
  seconds: 34,
  // Shot vertically on a phone. Without this the 16:9 default would letterbox
  // the middle of the frame.
  aspect: '9 / 16',
};

// Client, Bildeplassering (2026-09-19): "Undervisning › Pop opp video".
//
// Delivered as Captions_4C99FC.MP4: 1080x1920, 69 seconds, 171 MB. Re-encoded
// the same way as the prayer film — H.264 crf 26 at 540x960, which is the
// width VideoCard actually renders — to 5.4 MB, a 97% saving.
//
// DECLARED BUT NOT YET RENDERED. /undervisning has no TimedCta on it, and the
// popup needs a message namespace of its own (eyebrow, quotes[], give,
// dismiss, thanksEyebrow, thanksTitle) in three locales. `cta.prayer` is the
// only one that exists and its copy is about prayer times, so reusing it
// would put the wrong words on the teaching page. Waiting on copy.
export const TEACHING_POPUP_FILM: SiteVideo | null = {
  src: '/video/undervisning-film.mp4',
  poster: '/video/undervisning-film-poster.webp',
  seconds: 69,
  aspect: '9 / 16',
};

// Client, Bildeplassering (2026-09-19): "Tjenester › Video pop up".
//
// Delivered as "Campaign video (2) (1) 2.mov": 2160x3840, 47 seconds, 114 MB,
// and encoded HEVC. The codec matters more than the size here — HEVC in an
// MP4/MOV plays in Safari and is unreliable in Chrome and Firefox, so this is
// transcoded rather than merely compressed: H.264 crf 26 at 540x960, 3.6 MB.
//
// DECLARED BUT NOT YET RENDERED, same as TEACHING_POPUP_FILM: /tjenester has
// no TimedCta and there is no message namespace for one. See the note there.
export const SERVICES_POPUP_FILM: SiteVideo | null = {
  src: '/video/tjenester-film.mp4',
  poster: '/video/tjenester-film-poster.webp',
  seconds: 47,
  aspect: '9 / 16',
};

// Stand-in while nothing has been filmed. Only the poster is real — VideoCard
// is passed `placeholder` alongside it, so the src is never requested and the
// play button is inert. Swap IMAM_WELCOME off null and this drops out of use
// on its own; it is not a fallback that could ever try to play.
export const WELCOME_PLACEHOLDER: SiteVideo = {
  src: '',
  poster: '/photos/event-talk.webp',
};
