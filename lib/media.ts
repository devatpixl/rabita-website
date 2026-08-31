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


// Stand-in while nothing has been filmed. Only the poster is real — VideoCard
// is passed `placeholder` alongside it, so the src is never requested and the
// play button is inert. Swap IMAM_WELCOME off null and this drops out of use
// on its own; it is not a fallback that could ever try to play.
export const WELCOME_PLACEHOLDER: SiteVideo = {
  src: '',
  poster: '/photos/event-talk.webp',
};
