# What the redesign-by-talha branch changes

Two versions of this site were built separately. This branch merges them: the
look and structure come from `main`, the content and page coverage come from
the second build. Everything happens here, never on `main`.

Each entry says what was found and what was done about it, so the change can be
argued with rather than just accepted.

## Copy

**Dashes in body text.** Dashes were being used as punctuation inside
paragraphs. Sixty six strings across the three languages now take the
punctuation the sentence wanted: a comma where the clause continues, a full
stop where a second thought starts, a colon where a list follows. Arabic uses
its own comma, and keeps a comma where the next word is a conjunction, because
a full stop before one reads wrong. Headings, titles and labels keep theirs.

Two dashes were written into components rather than copy: the About page
rendered each board role as a dash followed by a placeholder name, and the
screen reader list for the building section joined a floor to its name with
one. Both are gone.

## Layout

**Hero gutter.** The hero used to run 570px wider than the sections below it
and then pad its own left with a calculation so the headline would still line
up with their headings. That padding was the large gap down the left of the
hero. The hero now keeps a narrow gutter of its own and the sections keep
theirs, which is deliberate: a full bleed photograph with a card on it carries
more width than a column of prose does.

**Photographs on laptops.** The four community photographs were a fixed 665px
tall, which is what a 4:5 crop comes to in a half width column. On a 1366 by
650 screen that is 102 percent of the viewport, so the bottom of the picture
was always below the fold. The width is capped rather than the height, so the
crop stays 4:5 and only shrinks where there is not room:

| screen | before | after |
| --- | --- | --- |
| 1366 x 650 | 665px | 522px |
| 1536 x 730 | 665px | 602px |
| 1920 x 800 | 665px | unchanged |

## Navigation

**The navigation did not navigate.** The five headings were inert spans, with a
note in the code saying links were disabled while only the home page was being
shown for review. Below the medium breakpoint there was no navigation at all,
so a phone could reach the home page and nothing else.

They are links again. Thirteen further pages existed that nothing linked to, so
each is now grouped under the heading it belongs to and reachable from a panel
that opens on hover. The gold rule slides between headings, opening is delayed
a little and closing more so crossing a gap does not make the panel flicker,
Escape and an outside click close it. Phones get a slide-in panel with the same
groups as accordions.

The interaction patterns come from a 21st.dev mega dropdown. It was rebuilt on
this project's own stack and tokens rather than installed, because the project
does not use shadcn and pulling it in for one component would have been a large
change to somebody else's build.

## Consent

The consent notice was a bar across the whole foot of the page. It is a card in
the corner now, sized so it clears the hero buttons. The consent is still asked
for and nothing third party loads before it is given, which is what the law
requires and what the SOP says.

## How this branch is deployed

`main` deploys to the original Vercel project. This branch has its own project
with its production branch set to `redesign-by-talha`, so the two never touch.
Both projects watch the same repository, so a push here also produces a preview
deployment inside the original project. That preview cannot reach production.
