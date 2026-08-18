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

## Mobile

Every page was measured on a phone before anything was changed: 17 pages in
all three languages at 360, 390 and 412 pixels wide, scrolled to the bottom,
checking sideways overflow, how big each thing is to tap, how small the text
gets, broken images and console errors. 85 page loads, every one of them with
something wrong. Nothing overflowed sideways and no image was broken, so the
faults were all in size.

**Buttons and links too small to hit.** Apple and Google both ask for 44 pixels
in each direction. The copy button beside every account number was 39 by 36 and
appeared on 89 pages. The wordmark in the header was 40 tall on all 17. The
carousel controls under the home page statement were 26 wide and 2 tall,
because the thin bar you see was itself the button.

One cause was behind most of it. A link is an inline box, and an inline box
ignores min-height, so ten links written with a minimum height of 44 were still
only as tall as their line of text, about 20 pixels. Those are inline flex now,
which is the same rule the rest of the project already uses where it works.

The carousel controls keep the thin bar and gain padding around it, with the
same amount taken back as negative margin, so the touch area is 44 tall while
the bar stays 2 and the row still lines up on the baseline it was tuned to.
They end up 32 wide rather than 44. Going wider would mean pushing the bars 18
pixels apart instead of 6, which changes how the row looks, so they stay as
they are. 32 by 44 still clears the level AA requirement of 24 by 24.

**Text below the legible floor.** 12 pixels is the usual floor on a phone. The
mono labels were at 11, the eyebrow above every page title at 11.2, the
inventory counters at 11.5, the tax badge in the gift ladder at 9. All are at
12 now. The badge fits on one line and the counters still sit on their bars.

**Two checkbox rows were not labels.** In the cookie notice the box was the
only thing you could press and the words beside it were tied to nothing. Each
row is a label now, so the text works as well and the row is a full width
target. The interest checkboxes on the volunteer form got a minimum height for
the same reason.

**Three links to pages that do not exist.** Every item on the news index linked
to an article page, and there is no article route, so all three were 404s.
Next was prefetching them on sight, which put the errors in the console of
anyone who opened the page. There is nowhere to send people until there is a
way to publish articles, so the items are entries rather than links.

After the fixes the same sweep reports 80 of 85 loads clean. The five that
remain are the carousel controls described above.

## How this branch is deployed

`main` deploys to the original Vercel project. This branch has its own project
with its production branch set to `redesign-by-talha`, so the two never touch.
Both projects watch the same repository, so a push here also produces a preview
deployment inside the original project. That preview cannot reach production.
