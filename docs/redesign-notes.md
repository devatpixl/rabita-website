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

## The home page passes

A round of review on the desktop home page. Each item below was something that
looked wrong on screen rather than something the code said was wrong.

**The header did not arrive as one move.** The wordmark animated as a single
block on its own timing while the five nav headings came in staggered on
another. The mark and the two lines of the name now use the curve and the
duration the headings use, landing just before them, so the header resolves
top left to right instead of in two unrelated pieces.

**Scrollbars read as browser chrome.** The page scrollbar and the one inside
the give card were both default grey against warm paper. They take the paper
colour now, with the thumb inset behind a paper coloured border so it floats
in the gutter, and gold on hover. Same treatment as the other Rabita build.

**The zoom gallery stepped.** Seven layers scale at once off the raw scroll
value, and wheel deltas arrive in lumps, so the tiles moved in visible steps.
The value goes through a stiff spring now, which evens it out without letting
the tiles trail the scroll, and each tile is marked as its own compositor
layer. Six of the seven images were also being deferred despite being on
screen from the first frame, so they decoded late; they load with the rest.

**Two renders had people in them.** The cafe and the imam meeting room were
both crowd scenes, and the brief is architecture without faces. They are
replaced with the main prayer hall and the qibla wall, both from the official
Norconsult set and both empty. Worth knowing for next time: almost every
render in that set is populated. These two are among the very few that are
not.

**Tiles ended on a hard rectangle.** Every gallery tile now carries a feathered
edge, so it dissolves into the dusk behind it instead of cutting off.

**Dashes.** Forty nine strings still used one, in headings as well as
paragraphs. All of them are gone. A pause inside a sentence takes a comma or a
full stop, a definition takes a colon, and an eyebrow takes the middot the rest
of the site already uses. Arabic uses its own comma.

**Placeholders were live.** Every one of the six carousel sentences ended with
"(draft)", in all three languages. Removed.

**The carousel caption ran on.** "Five prayers", the numeral 5 and "times a
day" sat on one baseline with a 24px hole between them, and the title repeated
the figure. The figure is its own line under the title now: numeral in gold,
label in mono caps, the same shape on every slide whether or not the slide has
a figure. The title is "Daily prayer", so the 5 is not saying the same thing
twice. The Friday label carried the men's capacity as well as the women's,
which was too much for one label, so the men's figure moved into the sentence.

**The carousel needed arrows.** It now takes a drag, a sideways trackpad swipe
or a flick, in any of the three languages, and the arrows are gone. The dots
stay, so there is still a visible control. Dragging an image used to start the
browser's own drag and kill the gesture; the pointer is captured and the native
drag refused.

**The chapter caption was two loose words.** "02 / 04" and the tag sat at
opposite ends of a wide column with nothing between them. A hairline joins
them into one caption under the photo. The animation is untouched.

**Four chapters opened on 160px of nothing.** The section above it ends on a
full bleed dusk band, which is already a hard stop, so the section does not
need a full opening measure on top of it. Cut to 96px.

**The building section pinned under the header.** It pinned to the top of the
viewport while the site header is sticky and 77px tall, so the eyebrow and the
heading sat behind it for the whole section. It pins below the header now.

**Three labels in the building drawing collided.** The label column had 178
units before the neighbouring building and the longest fact line needs about
157, so "reading hall, seminar rooms" landed on the neighbour; the canvas is
wider and the neighbour moved out with it. "-01" is wider than "00", so the
level number ran into the floor name; the numbers are right aligned and every
row now has the same gap. The plot dimension sat a third of the way into the
-01 level, on top of the parking bays; it moved onto the ground line, where it
belongs, with a knockout so it stays readable over the excavation hatching.

### Follow up on that pass

Three things the pass above either caused or did not go far enough on.

**The carousel caption was being painted over.** The pane holding the whole
section was capped at one viewport height with its content centred inside,
so anything over budget spilled past the section and the next section covered
it. Moving the figure onto its own line added about 24px, which put the
longest slide over on a 740px viewport: the last line of the sentence was
hidden behind the section below. The cap is gone, so the pane grows on a short
screen instead of clipping, and the rail gives back the height the caption
took.

**The chapter caption fell off the fold.** The sticky photo is capped so its
own bottom lands one viewport down, which left nothing for the caption under
it. On a 740px viewport it was 4px past the edge. The cap now accounts for the
caption too.

**The drawing labels were 7 to 8px on screen.** They are 8.5 to 10 units in a
700 unit canvas that scales to the height available, so they arrived well under
the 12px floor the rest of the site keeps. They are 15 and 17 units now, which
is 12.5 to 14px on a 1920 by 820 window. The canvas is 840 wide rather than 700
to give the bigger type room; that costs nothing, because the drawing is
constrained by height, not width.

Three things had to move with the larger type: the street label was tracked in
so it stays inside the building wall, the plot dimension moved to the right end
of the ground line so the two annotations are not stacked, and the leading
between a floor name and its detail line went from 13 units to 19, which at the
old sizes was fine and at the new ones was set solid.

Checked at 900, 820, 740 and 680px viewport heights: no clipping at any of
them. The labels do keep shrinking with the drawing on very short windows,
which is inherent to a pinned section that fits one screen.

### Second follow up

**The street label was in a 24 unit gap.** Between the ground floor furniture,
which ends at y 496, and the ground line at 520, there are 24 units. At 15 the
label needed 20 of them and touched both. The two ground annotations are 13
now, a step under the floor labels, which is the hierarchy the drawing wants
anyway: a reader takes the floor names first. Measured after the change: the
street label clears the furniture by 3 and the line by 3, and the plot
dimension clears the line by 6 and the parking bays by 10.

**The chapter caption was wider than its photo.** The photo is capped so it
fits the viewport, the caption was not, so on any window where the cap bound
the caption ran wider than the picture it belongs to. It takes the same measure
now, and the two line up at every height tested.

**The photo hung from a fixed offset.** It sat 96px below the top with all the
slack underneath it. The sticky block now fills the band under the header and
centres its own content, so the gap above and below match within about 3px at
940, 870, 800 and 740px viewport heights.

**Dead space between chapters.** 192px between panels left a visibly empty
column beside the photo. It is 128px, the list padding halved, and the section
foot matches its head. The section is 2 396px rather than 2 780px and all four
chapters still take their turn as you scroll, which was worth checking, since
the tracking depends on a panel dominating the middle of the viewport.

### Floor plates, centred and checked

**A floor was named wrong.** Level −02 was labelled PARKING in all three
languages while its own body copy says "storage for the school and library,
and the technical installations that keep the building warm". Only −01 is
parking. It reads STORAGE, technical services now.

The rest of the sequence checks out. Walking the eight scroll steps: 01 / 07
is floor −02, then −01, 00, 01, 02, 03 and 04 at 07 / 07, and each one matches
its label in the column and its panel on the left. Seven floors, two below the
street, which is what the intro says.

One thing left alone: −02 still draws the three rounded bays the parking floor
draws, because they share a renderer. They read as racks as easily as cars, so
it is not wrong, but it is worth knowing if that floor ever gets its own
drawing.

**The ground floor furniture was off centre.** It sat 48 units from the left
wall and 20 from the right, and low in its band. The street label was inside
that band too, taking the bottom of it, which is what made the floor look
bottom heavy. The label annotates the ground line from outside the walls now,
where the line runs the full canvas anyway, and the furniture is centred.

Measured margins per floor after the change, in SVG units, left / right and
top / bottom:

| floor | left | right | top | bottom |
| --- | --- | --- | --- | --- |
| −02 storage | 20 | 20 | 33 | 33 |
| −01 parking | 20 | 20 | 33 | 33 |
| 00 entrance | 34 | 34 | 26 | 27 |
| 01 youth | 12 | 12 | 27 | 26 |
| 02 library | 28 | 28 | 20 | 20 |
| 03 school | 16 | 16 | 20 | 16 |
| 04 prayer | 24 | 24 | 11 | 11 |

Three of those needed moving. The library had four shelves one side and three
the other, so the group sat 20 from the left wall and 36 from the right. The
school's two figures pressed harder against the right wall than the classrooms
did against the left. The youth floor sat 41 from the top of its band and 12
from the bottom.

### The build fund reads as a survey line

The campaign section had a three segment bar and, under it, a separate row of
years. Two graphics for one idea, and the reader had to compare them to work
out which phase the money had reached.

It is one scale now. The rule runs the whole goal, the phase years sit on it
as station marks, and a gold run is drawn from zero to where the money stands,
carrying a marker that settles at the end of the draw. A tick at the far end
states the goal, so the run is measured against something.

The scale rather than a bar for two reasons. It is the same drawing language
as the cross-section directly above it, hairlines and mono ticks, so the two
sections read as one document. And it puts the phases and the money on the
same line, so which phase the raised figure has actually reached is something
you see rather than something you calculate.

Drawn on view, once, and the whole thing renders in its final state under
reduced motion.

### Two sections carried over from the other build

Rabita said they liked two sections on the second build, so both are here now,
in this project's typography, palette and primitives rather than the other
one's.

**What your gift builds** replaces the gift ladder at slot six. Same four
costed items, same amounts out of `lib/gifts.ts`, same copy out of
`giftLadder`, shown as photographs rather than as a stack of figures. Nothing
was invented; only the presentation changed.

**Sadaqa jariya** is new, at slot eight. The dedication ask was named as
chapter four of Impact story but had nowhere on the home page to actually ask,
which is a different job. Argument on the left, room on the right, four rooms
behind a picker.

**On the sections all looking alike.** They did. Measured down the page, the
tone ran dusk, dusk, then eight sections of warm off white before the
membership band. The three paper tints are #FAF8F4, #F2EEE7 and #EDE6D7, which
are within a few percent of each other and do not read as a change of surface
at all. What your gift builds sits on dusk, which breaks that run in the
middle and uses a colour already in the palette. The longest unbroken paper
run is four sections now instead of eight.

**On the photographs.** The folder of real Rabita photography turned out to
hold aliases rather than files, 235 of 236, so nothing in it can be used until
it is re-exported. The four gift cards use real photographs of the congregation
that are not on the site anywhere else. The four rooms use renders, because
those rooms do not exist to photograph, and all four are people free. Every
image is referenced once, from a small map at the top of each component, so
swapping them later is a filename change and nothing else.

### Both carried sections now behave the way they did

They were ported as static blocks first, which lost the point of them. The
behaviour is back, taken from the other build rather than reinvented.

**What your gift builds.** A spine draws across the top, the four cards lift in
one after another about 90ms apart, each picture wipes up inside its frame on a
clip path, and each figure counts up from zero on its own stagger. Pointing at
one card pulls the other three back, dimmed and slightly blurred, and the card
under the pointer raises its ask. It replays whenever the section is entered
from either direction, because a once-only reveal is invisible to anyone who
scrolls back up to look again. Each card opens the giving sheet with its own
amount already filled in.

**Sadaqa jariya.** The section's own trip past the window is divided between
the four rooms, so scrolling walks through them. Touch, keyboard or the picker
take over the moment they are used and the scroll leaves it alone from then on.
Each room travels sideways with the picture lagging the frame it sits in, which
is what gives the move depth instead of reading as a slide deck. The four
tracks under the picture fill as you get to them. Arabic travels the other way.

Both fall to their finished state under reduced motion, with every duration at
zero rather than a fast version of the same move.

### Section rhythm

Two sections meeting put their padding back to back, so the 10rem opener meant
320px of empty page between one block of content and the next. The scale is
pulled in one step, 6/8/10rem to 4.5/6/7rem, and the ratio between the three is
unchanged so nothing had to be retuned per section. The meter was overriding
the token with a raw py-32 that is now larger than the token itself, so it
follows the scale again. Total vertical padding down the page is 1 536px.

### Two dry sections given something to do

**Prayer times.** The most used thing on a mosque site was a flat list of six
figures, which answers none of the questions a reader actually arrives with.
The window you are inside is marked now, with a line under it that fills as
that window runs down, and the next prayer counts itself down beside its time.
Recomputed every 30 seconds. Same times, same order, same tabular figures; the
clock keeps running under reduced motion and only the entrance stagger drops.

**Where the money goes.** The four assurances were four paragraphs in a two by
two grid. They are all verifiable claims, a tax approval, an audit, a permit,
an org number, so they are a register now: one row each, the rule drawn across
it in sequence on entry, a mono stamp saying what the row is evidence of, and
the link with its arrow. Same copy, same links, same order. The layout says
what the section is for instead of leaving the reader to work it out.

One regression caught on the way: the stamps went in at 0.7rem, which renders
at 11.2px and is under the floor the rest of the site keeps. They are 0.75rem.

### Four finishing passes

**The giving sheet was a square panel.** Rounded to 16px and clipped, with a
soft shadow so it lifts off the page, and the backdrop went from a flat 50
percent scrim to 55 with a 3px blur, which reads as the page receding rather
than a rectangle cut out of it.

**The gallery feather was too heavy.** 7 percent of each edge is most of a
small tile. It is 3, enough to lose the corner without eating the picture.

**The visit photograph was a small box floating above the copy**, which made
the strongest thing in the section the weakest part of the layout. It is 4:3
and carries its column now, with a seal on the corner: the label running round
the ring and the star mark at the centre, turning once every 44 seconds and not
at all under reduced motion. Used once on the page, and it does a real job,
since the thing a reader most needs to know about dropping in is that the door
is open every day.

Two bugs found while placing that seal, both worth writing down:

`cn` is plain clsx with no tailwind-merge, so a base `relative` on a component
and an `absolute` passed in from the caller both land and CSS source order
decides, not the caller. Components here cannot expect to have their position
overridden from outside; the caller wraps them instead.

`bg-paper/95` works and `bg-paper/92` silently produces nothing, because 92 is
not on Tailwind's opacity scale. The seal's disc rendered fully transparent and
looked like a stacking bug for two attempts. Arbitrary opacities need the
bracket form.

### The build fund, and the meeting notice

**The build fund needed weight.** The scale carries the phases but it is a
hairline, so the section still read as a number over a thin line with half a
column doing nothing under it. The goal is drawn as a hundred marks now, one
for each million kroner, in the diamond lattice the facade is made of. Twenty
six light up in order when the section arrives.

A percentage is a fact you have to convert before it means anything. A field of
a hundred marks with twenty six lit is a picture of how much is still dark,
which is the argument the section is making. The geometry is not decoration
either: the facade is a diamond lattice, and every mark is one panel of it.

**The meeting notice was a date poster.** A date tells a reader when the
meeting is, not whether to do anything about it yet, and the whole section
argues that a vote has to be bought before the doors close. It carries the days
remaining now, live, and renders nothing once the date has passed rather than
counting into the negative.

### Comments

Every comment added on this branch is one line. The blocks that had grown to
four and nine lines are gone.

Worth recording: the first pass at this collapsed the other build's comments as
well, including the eight step description at the top of the building section
and the layout maths in the hero. Those were restored and only the comments
added on this branch were touched. The homepage section map is his structure
and stays as a map.

### Review pass: corners, sizes, header, heights

**The hero card had square corners.** It is rounded, but a scrollbar was
rendering inside the rounded box and squaring the top corner. The bar is hidden
on that card, and native scrollbar arrows are switched off site wide, since the
theming did not cover them.

**One gallery tile was a third of its neighbours.** 15vh by 15vw against 25 to
45vh everywhere else. It is 25vh by 22vw.

**The header opens on load.** It arrives clipped to a pill in the middle of the
bar and spreads to full width, once, over 1.1 seconds after a short hold. Done
with clip-path so nothing reflows, and it does not run at all under reduced
motion.

**The congregation section put its own heading under the header.** The pane
filled the viewport from its very top, so the sticky header covered the
statement and the caption fell off the bottom. It clears the header now and the
rail gives back the height that costs. Measured at 900px: heading at 112px,
last line 151px clear of the fold.

**The seal is gone** from the visit photograph.

**Section heights.** Sections that ran over one screen make a reader scroll to
read one idea. Measured in screens at 1920 by 900, before and after:

| section | before | after |
| --- | --- | --- |
| What your gift builds | 1.10 | 1.00 |
| Where the money goes | 1.11 | 1.02 |
| Prayer and visit | 1.27 | 1.14 |
| Events | 1.17 | 1.11 |

Nothing was cut from the content; the gift cards are square rather than 4:5,
the visit photograph is 16:10 rather than 4:3, and the register and events rows
are on a tighter rhythm.

### The header contracts before it opens, and the gallery is a grid

**The header animation was only half the move.** It started as a pill and
opened, where what was wanted is the bar pulling in to a pill first and then
opening back out. Three keyframes now: full width, in to a 41 percent inset
pill, back out. Recorded from the first frame, the inset peaks around 24 to 37
percent depending on how busy the main thread is at load, then returns to zero.

That change caught a real bug of my own making. The animation was set to `both`,
so the final keyframe's `clip-path: inset(0)` stayed on the header for good,
and a clip on the header clips anything drawn below it. The desktop mega panel
hangs 275px past the header's own box, so it was being clipped away entirely
and the whole navigation was invisible on hover. It is `backwards` now, so the
clip is released when the animation ends and the settled value is `none`.

**The gallery tiles overlapped and were all different sizes.** Six tiles ran
from 15vh to 45vh, positioned by hand, and two of them crossed. They are one
size on a row above and a row below the centre, and every gap measures 40 to
41px, horizontally and vertically.

**The carousel had gone small.** Clearing the header cost the rail its height
and the pictures read as zoomed out. The rail is back to 52svh, 468px at a
900px viewport, and the section still fits: heading clear of the header, last
line 120px clear of the fold.

## How this branch is deployed

`main` deploys to the original Vercel project. This branch has its own project
with its production branch set to `redesign-by-talha`, so the two never touch.
Both projects watch the same repository, so a push here also produces a preview
deployment inside the original project. That preview cannot reach production.
