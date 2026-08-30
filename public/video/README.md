# Video

Drop the imam's welcome here, then fill in `IMAM_WELCOME` in `lib/media.ts`
(the object is already written out, commented, right under the `null`).

    imam-welcome.mp4            H.264, 16:9, 20-40 seconds
    imam-welcome-poster.webp    one still frame, same crop
    imam-welcome.no.vtt         subtitles — most people watch muted
    imam-welcome.en.vtt
    imam-welcome.ar.vtt

Nothing else has to change: the thank-you card picks it up, and the prayer
popup can show it too by passing `showVideoInAsk` to <TimedCta>.
