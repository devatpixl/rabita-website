# Rabita — Build Specification for Claude Code

Build the new **rabita.no**: a Norwegian mosque and cultural centre raising 100M NOK
to construct a new building at Calmeyers gate 8, Oslo. rabita.no absorbs
donate.rabita.no — one domain, one total, one timeline, one visual language.

**The site's single job is converting donations.** Everything else supports that,
and the congregation's daily needs (prayer times, services) must never be buried
underneath the campaign.

This spec is derived from a live audit of both existing Rabita sites and 30+
reference sites. Where it states a rule, the rule came from evidence. Follow it.

---

## 0. Stack

```
Next.js 15 (App Router) · TypeScript · Tailwind · Motion (framer-motion)
next-intl for i18n · Zod + React Hook Form · Prisma + Postgres
```

- Route-based locale: `/no` (default), `/en`, `/ar`. Locale in the URL so a link
  shared in a WhatsApp group opens in the language it was shared in.
- RTL for Arabic in the layout system from the **first commit**, using logical
  properties (`ps-`, `pe-`, `ms-`, `me-`) throughout. Never retrofit.
- Server components by default. The giving card is a client island.
- Amounts formatted per locale via `Intl.NumberFormat`.

---

## 1. Design tokens

### Colour — four roles, no more

```css
--ink:      #1A1A18;  /* all body text and headings */
--paper:    #FAF8F4;  /* page background, warm off-white */
--paper-2:  #F2EEE7;  /* alternating section bands, card fills */
--rule:     #E4DED3;  /* borders, dividers */
--gold:     #C0A165;  /* Rabita brand mark, rules, small accents ONLY */
--action:   #B4381F;  /* give button, selected chip, progress bar — NOTHING else */
--ink-60:   #5B6157;  /* secondary text, verify 4.5:1 */
```

**Two hard rules:**

1. **Gold never lands on a button.** The current site's failure is that gold carries
   the prayer strip, the logo, headings, links and the donate button at once, so it
   signifies nothing. Gold is for the wordmark, hairline rules, and the small eyebrow
   labels. That is the entire list.
2. **`--action` appears in exactly four places**, site-wide: the `Gi en gave` button in
   the nav, the selected amount chip, the submit button, and the progress bar. If it
   appears anywhere else, remove it.

Light mode is the product. No dark theme — serious Norwegian cultural institutions
(nasjonalmuseet.no, snohetta.com) are light, high-type, low-colour, and Oslo kommune,
the press and large donors read that register as institutional seriousness.

Contrast floor: 4.5:1 body, 3:1 large text. Check the gold with a tool; do not assume.

### Type

```
Display / headings:  IBM Plex Serif 600
Body / interface:    IBM Plex Sans 400 / 600
Arabic:              IBM Plex Sans Arabic
Numerals:            tabular figures, everywhere, always
```

One superfamily so Arabic pages keep the same rhythm instead of changing character.
Tabular figures are non-negotiable — the campaign total updates, and proportional
figures make it jump sideways when it does.

**Scale — five sizes, nothing between:**

```
display   clamp(2.75rem, 6vw, 4.5rem)   line-height 1.02, tracking -0.02em
section   clamp(2rem, 4vw, 2.75rem)     line-height 1.1
card      1.25rem
body      1rem (16px floor on mobile)   line-height 1.6, measure 65–75ch
label     0.8125rem                     uppercase, tracking 0.08em
```

Section headings on the project page at 44px and above.

### Spacing & motion

4/8px rhythm. Section vertical rhythm 96 / 128 / 160. Radii: 4px on chips and
buttons, 0 on image blocks (no cards, no borders, no shadows around renderings).

Motion stays out of the way: count-up on the total, 300ms fade-and-rise on section
entry (once, never on re-scroll), state change on chips. Nothing autoplays.
`prefers-reduced-motion` fully respected.

### Imagery

- **Renderings for the future, photographs for the present. Never mixed in one section.**
- Full-bleed or full-column, one image per row, alternating sides. No cards, no
  borders, no shadows.
- Request source files above 2 560px from Norconsult — current renders are 1 030px,
  not enough for a hero.
- Faces, not backs of heads.
- **Geometry as texture, never as a border.** The real facade already carries the
  pattern. A decorative frame around every section is the standard mosque-website
  failure. Do not add ornamental arches — Rabita has a real facade covered in real
  geometry, photographed at dusk, in central Oslo. Spend the visual budget on the
  building.
- WebP/AVIF with explicit dimensions so layout never shifts under a tapping thumb.

---

## 2. Navigation — three layers

| Layer | Contents | Behaviour |
|---|---|---|
| Utility strip | Today's prayer times with countdown to next, Friday time, Hijri date beside Gregorian, text-size control (3 steps, persisted), language as a **globe** with Norsk / English / العربية in their own scripts | Above the logo. Scrolls away. |
| Primary bar | Wordmark left · five items centre · Search, Min side, `Gi en gave` right | Sticky, condenses after hero |
| Campaign strip | Live total, % of goal, current phase | Appears only after hero scrolls past |

**The five items** (nothing is deleted, things move):

- **Moskeprosjektet** — building, architecture, timeline, drawings, ways to give, where the money goes, accounts, tax deduction, FAQ
- **Bønn og tjenester** — prayer times, Friday prayer, nikah, janaza, shahada, counselling, hajj/umrah
- **Undervisning** — Arabic and Quran school, courses, calligraphy, youth programme, camps, library
- **Besøk oss** — address, hours, guided visits for schools/universities, interfaith dialogue, group bookings
- **Om oss** — history from 1987, board, statutes, membership, volunteering, news, press, annual reports, contact

Aktuelt moves under Om oss. Ressurser splits between Undervisning and Om oss.
Bønnetider moves up into the utility strip.

**Give button rules:**
- One label everywhere: **`Gi en gave`**. Never "Donate", never "Støtt oss" on one page and "Bidra" on another.
- One colour, reserved.
- Never off-screen — sticky bar on desktop, half the fixed bottom bar on mobile.
- Never a new domain. Opens a sheet on the same page, no page load.

**Mobile:**
- Fixed bottom bar, two parts: `Gi med Vipps` left, `Velg beløp` right. Thumb reach beats convention.
- Prayer times inside the menu as well as the strip.
- Five accordion items, same order. Language switch at the bottom in each script, no flags.
- **44px minimum on every chip and button.** Amount chips are the most-tapped elements on the site.

---

## 3. The giving card — build this first

This is the most important component. Follow the Norwegian convention exactly; a
visitor landing on rabita.no has already used this component on every charity site
they have given to, so it needs no explaining. Breaking the pattern costs conversions
and buys nothing.

**Anatomy, in the order the visitor meets it:**

| # | Element | Content |
|---|---|---|
| 1 | Frequency tabs | `Månedlig` and `En gang`. **Månedlig selected by default.** |
| 2 | Preset chips, low→high, left→right | 200 · 500 · 1 000 · 2 500 · 5 000 · Annet. **500 preselected.** |
| 3 | Free amount field | Labelled `Valgfritt beløp`. Never hidden behind a link. |
| 4 | Impact line, bound to selection | `500 kr i måneden i tre år finansierer en bønneplass.` |
| 5 | Zakat checkbox | `Dette er zakat` — zakat has rules about where it can go, and a donor needs to know Rabita has thought about it. Changes designation. |
| 6 | Primary button, names the method | `Gi 500 kr/mnd med Vipps` |
| 7 | Secondary button | `Kort, AvtaleGiro eller bank` |
| 8 | Reassurance line | `Godkjent for skattefradrag. Org.nr. 983 228 364.` + padlock |

**Why each decision:**
- Most donors pick the middle option → put the amount you actually want in the middle and preselect it.
- The top preset anchors the whole ladder (one study: a 400-dollar top preset produced an average gift of 143; a 5-dollar top preset produced 20) → do not stop at 500 kr, carry it to 5 000.
- A tabbed one-time/monthly form has been reported to lift donations ~15% → build the toggle, never two separate pages.
- Removing the site header during the flow lifts conversion sharply → the giving *sheet* is a focused overlay with nav suppressed, not a full page.
- Tying each amount to a concrete outcome raises average gift → Rabita has better material for this than any charity, because the budget is costed room by room.

*These figures are from published nonprofit fundraising studies, not Rabita's data.
They point at a direction, not a promised number — which is why the measurement list
in §9 matters more than the percentages.*

**Third route:** a `Støtt som bedrift` link beside the tabs, pointing to its own page
with a named contact. Rabita has 4 200 members and many run businesses; a company
gift is a conversation, not a checkout.

**Payment:** Vipps primary and largest — it is a phone app and this campaign will be
given to on a phone. Vipps recurring donations is a plug-in product (QR code, no
integration work) that also works on a poster in the mosque and on the screen at
Friday prayers. Card and AvtaleGiro secondary. **One provider, on domain.** Retire
the Solidus checkout, the raw Stripe link and the cont.rabita.no prayer-space portal —
three unconnected checkouts under one campaign today.

**Thank you page at `rabita.no/takk`**, Rabita's own — receipt confirmation, the next
milestone, a share prompt, a tracked conversion event. Currently the thank-you page
belongs to the payment provider, which is the cheapest place on the site to ask for
a share and it's being given away.

---

## 4. Homepage, section by section

| # | Section | Contents |
|---|---|---|
| 01 | **Hero + giving card** | Full-bleed evening facade rendering. Eyebrow `Calmeyers gate 8, Oslo`. Headline. Giving card on the right, complete per §3. Below fold nothing. |
| — | **Congregation strip** | Immediately under the hero: two buttons only, `Bønnetider` and `Fredagsbønn`. A member never scrolls through the campaign to find what they came for. This is the cheapest way to stop the congregation resenting a donation-led homepage. |
| 02 | **Live total and phase** | One large figure against 100 000 000, one bar, last-updated date, note that it updates automatically. A **named sub-campaign with its own small target** — 100 million kroner is too large to feel finishable. Beside it: last month's total, 4 200 members, 40 nationalities. |
| 03 | **What your gift builds** | Four cards from the real project budget: a prayer space, a desk in the school, a shelf section in the library, a panel in the facade. Each opens the giving sheet **pre-filled**. |
| 04 | **The building, floor by floor** | BIG.dk list format: renderings alternating left and right, floor label, short heading, two sentences. One column. The Alhambra + Norwegian architecture line goes here, stated plainly and **attributed to Håvard Lindgard Fagernes, Norconsult**. Renderings get ~70% of vertical space, text 30%. |
| 05 | **Sadaqa jariya — sponsor a prayer space** | Giving in the name of someone who has died. Own photograph, own flow, name entered and acknowledged, something to send to the family afterwards. `Døner en bønneplass` button sits directly *above* `Gi en gave`. |
| 06 | **Where the money goes** | Four cards: tax deduction and how it works, audited accounts to download, the building permit from Plan og bygningsetaten, the organisation with number and founding year. Open with the running cost stated plainly — the old building consumed most of the organisation's resources in maintenance, and the fifteen apartments exist so that never happens again. |
| 07 | **The congregation today** | Photographs, not renderings. 4 200 members, 40 nationalities, 5 000 student visitors/year, 19 teachers, 400 pupils. This answers whether the building will actually be used. |
| 08 | **Prayer, Friday, and how to visit** | Full week, Friday time, opening hours, address, booking form for school and university groups. |
| 09 | **News and events** | Three cards. Every event captures a signup and **the list must be exportable**. |
| 10 | **Membership and volunteering** | Three tiers: free ordinary, 1 000 kr/year with voting rights, free under-15. A real module — signup, payment, annual renewal, voting-eligibility flag. |
| 11 | **Footer** | Second giving block, **Vipps 29656 as selectable text, set large** (it is an image today, so it cannot be copied or read by a screen reader), bank and IBAN with copy buttons, address and hours, newsletter, language switch, privacy and accessibility statements, audited accounts and building permit. |

**Strongest facts to place next to the right images:**
- Women's prayer capacity goes from 100 places to 500. Men from 500 to 2 000. (Next to the women's entrance rendering.)
- The largest school of its kind in Norway for teaching Arabic to non-Arabic speakers.
- Fifteen apartments let out, so the centre will not come back asking again in ten years.
- The library and youth club are the two arguments that are not about prayer: a study space in central Oslo, and somewhere for teenagers to be on a Friday evening.

---

## 5. Components — sixteen, built as a set

Build them as a set, not page by page. That is what stops three languages and two
audiences turning into three separate websites.

| Component | Behaviour | Pri |
|---|---|---|
| Giving card | Per §3 | 1 |
| Giving sheet | Same card as focused overlay, nav suppressed, no page load, closes on Escape | 1 |
| Campaign meter | Live total, goal, % bar, current phase, last-updated — **pulled from one source** | 1 |
| Gift ladder card | Image, amount, one sentence of what it buys, opens sheet pre-filled | 1 |
| Dedication field | Name, optional relationship, what the donor gets back to share | 1 |
| Sticky give bar | Desktop: condensed nav + total. Mobile: fixed two-part bottom bar | 1 |
| Trust band | Tax deduction, audited accounts, building permit, org number, padlock | 1 |
| Thank-you block | Receipt, next milestone, share prompt, conversion event | 1 |
| Prayer times widget | Today, countdown to next, Friday time, Hijri date, full week on expand | 1 |
| Language switcher | Globe, three scripts, locale in URL, RTL when Arabic active | 1 |
| Rendering block | Full-bleed or half-width, floor label, heading, two sentences, alternating | 2 |
| Stat row | 2–4 figures at display size, short label under each | 2 |
| Event card + RSVP | Details, signup form, exportable list | 2 |
| Request form | One reusable form, subject switch for nikah / janaza / shahada / visits / contact | 2 |
| Membership selector | Three tiers, signup, payment, renewal, voting flag | 2 |
| Text size control | Three steps, persisted | 3 |

**Build order:**

1. **The money path** — giving card, giving sheet, campaign meter, trust band, thank-you block. Can ship as a single campaign page before the rest of the site is finished.
2. **The frame** — navigation, prayer times widget, language switcher. The reason the congregation keeps coming back.
3. **The persuasion layer** — gift ladder, dedication field, rendering block, stat row. Lifts average gift, not conversion rate.
4. **Operational** — events, forms, membership. Lower urgency for the campaign, higher for whoever runs the mosque day to day.

---

## 6. Pages

**Priority 1:** `/` · `/moskeprosjektet` · `/gi-en-gave` · `/doner-en-bonneplass` ·
`/hvor-pengene-gar` · `/takk` · `/personvern-og-tilgjengelighet`

**Priority 2:** `/bonnetider` · `/besok-oss` · `/undervisning` · `/tjenester` (nikah,
janaza, shahada, counselling, hajj/umrah — each its own page and request form, named
in the words a member would actually type) · `/aktuelt` · `/arrangementer` ·
`/medlemskap`

**Priority 3:** `/frivillig` · `/om-oss` · `/kontakt`

`/gi-en-gave` treatment: evening facade full-bleed, two words over it, giving card
below the fold — it should feel like it belongs to a building rather than to a form.
Split it into named routes: one-off, monthly, dedication, company, legacy. Somebody
giving 200 000 kroner needs a different path from somebody giving 200.

**One deliberate omission: no forum, no open comments, no public member boards.**
Moderation is a real liability for a religious organisation, nobody at the mosque has
capacity for it around the clock, and user content adds data-protection obligations
the project does not need. Publish-only, everything through an editor.

---

## 7. Data model (Prisma sketch)

```prisma
model Campaign      { id, goalNok, raisedNok, lastMonthNok, updatedAt, phase, subCampaign }
model Donation      { id, amountNok, recurring, isZakat, designation, dedicationName,
                      dedicationRelation, provider, status, createdAt, donorId }
model Donor         { id, name, email, phone, fnrEncrypted?, taxOptIn, createdAt }
model Member        { id, tier, votingEligible, paidUntil, donorId }
model PrayerTime    { id, date, fajr, sunrise, dhuhr, asr, maghrib, isha, jumaTime }
model Event         { id, slug, title, startsAt, location, capacity, body }
model Rsvp          { id, eventId, name, email, phone, createdAt }
model VisitRequest  { id, groupType, size, preferredDates, contact, status }
model ServiceRequest{ id, kind /* nikah|janaza|shahada|counselling */, contact, notes }
```

**`fnrEncrypted` is the sensitive one.** The tax deduction requires the donor's
fødselsnummer to be reported to Skatteetaten. Encryption at rest with a KMS-held key,
column-level access restriction, a documented retention policy, a data processing
agreement, EEA hosting region. Design it in now or the donation flow gets rebuilt
later. The fnr step is optional and skippable, and the screen must earn the ask in one
plain sentence.

---

## 8. Non-negotiables

**Accessibility.** *Universell utforming* is legally required for public-facing sites
in Norway. WCAG 2.1 AA: contrast checked on the gold specifically, visible focus rings
on every chip and button, real `<label>` elements not placeholder text, full keyboard
operation of the giving sheet including Escape, semantic heading order, skip link,
text-size control in the utility strip, `alt` on every rendering.

**Performance.** No autoplaying video in the hero — this is the largest single win
available (the current donate site autoplays a three-minute YouTube embed with player
chrome visible). Renderings as WebP/AVIF with explicit dimensions. Third-party scripts
behind the consent banner. Giving sheet opens with no page load. CLS < 0.1.

**Tracking.** GA4 and the Meta pixel with the Conversions API, both wired to the
consent banner, **live on launch day**. Without them no donation can be attributed to
the advertising that produced it and every campaign afterwards runs blind.

**GDPR.** Norway is EEA. Granular consent banner as a first-class component, not a
plugin default.

---

## 9. What to measure

| Measure | Why |
|---|---|
| Homepage sessions → completed gifts | The number the whole design is optimised for |
| Share of gifts that are monthly | A build running to 2028 lives on recurring donors |
| Average gift, split by device | Tells you whether the amount ladder is anchored right |
| Drop-off between amount chosen and payment confirmed | Exposes checkout problems — today this should be very high |
| Time to first meaningful paint on 4G | The autoplaying video is the current cost |
| Signups captured per event | The contact list makes every future campaign cheaper |
| Share of sessions per language | Answers whether Arabic earns its upkeep |

---

## 10. Verified facts and copy

```
Org.nr           983 228 364
Address          Calmeyers gate 8, Oslo
Vipps            29656
IBAN             NO421503.35.60386   ·   SWIFT DNBANOKK   ·   Konto 1503.35.60386
Founded          1987, first mosque in Oslo not tied to one nationality
Architect        Håvard Lindgard Fagernes, Norconsult
Building         6 762 m², six floors above ground, two below
Campaign         26 995 179 kr of 100 000 000 kr (27%) · +1 759 653 kr last month
Community        4 200 members · 40+ nationalities · 400 pupils · 19 teachers
                 · 5 000 school and university visitors a year
Status           Old building demolished Ramadan 2025 · site cleared · build from Q1 2026
Tax              Deduction up to 25 000 kr/year — the page currently says 2022, fix it
Royal visit      King Harald V and Crown Prince Haakon, October 2009
```

**Norwegian copy worth testing:**

| Element | Option |
|---|---|
| Headline | `Tomten er klar. Nå reiser vi bygget.` |
| Headline | `Grunnlaget er klart. Er du?` (Rabita's own line, already good) |
| Headline | `En moské for generasjonene som kommer.` |
| Give button | `Gi en gave` |
| Monthly button | `Gi 500 kr i måneden med Vipps` |
| Impact line | `500 kr i måneden i tre år finansierer en bønneplass.` |
| Impact line | `25 000 kr gir en pult i skolen der 400 barn får undervisning hvert år.` |
| Trust line | `Godkjent for skattefradrag. Org.nr. 983 228 364.` |
| Dedication | `Gi en bønneplass i navnet til noen du har mistet.` |

---

## 11. Additions worth building

- **Donor wall** — every name that gave, one page, searchable, filtered by phase. People share a page their own name appears on, families give in a relative's name to see it there, and the length of the list is the strongest proof of support to put in front of a large donor or a journalist.
- **Monthly construction updates** — a dated photograph from the site with one line about what it shows. Turns a static campaign into something with a pulse, and each update is a reason to email the donor list. An email saying the foundation is poured converts better than an email asking for money.
- **Ramadan mode** — a switch, not a redesign. Prayer times to the top of every page, an iftar countdown replacing the hero, a nightly amount instead of a monthly one, and the ability to schedule a gift for a specific night in advance. Roughly 80% of Islamic campaign money lands in the first and last three days of a giving window, and Ramadan is the biggest window there is.
- **Press page on the Alhambra line** — renderings at full resolution, architect's name, floor areas, permit, downloadable image pack. Costs a day and makes Dezeen/ArchDaily coverage possible.
- **Friday prayer QR** — 2 000 people in one room is the highest-converting moment Rabita has. QR on the screen and on a poster, opening straight into the giving sheet with the amount pre-chosen. Vipps supports this with no development work.
- **Zakat calculator** — brings search traffic every Ramadan from people not looking for Rabita yet. The cheapest new audience available.
- **Capture the 5 000 school visitors** — they walk through the door and none of them leave a contact detail today.

---

## 12. Do not build

- Dark, near-black theme with gold buttons. That is the Behance mosque template, and it makes a permanent civic project look generic.
- Ornamental arches, decorative pattern frames, calligraphic hero graphics. The real facade carries the geometry.
- Dense navigation with several simultaneous CTAs and a carousel of causes (islamic-relief, muslimhands). That layout is built for forty competing emergency appeals; borrowing it makes a permanent civic project look like a crisis.
- A grid of event posters as the homepage (centralmosque.org.uk, islamnet.no). One primary action per screen. Posters belong in an events section.
- Flags as a language switcher. Globe, always.
- Any second checkout domain.

---

## 13. Blockers — resolve before building the hero

1. **Which completion date is correct?** April 2027 (project page), 2028 (phase budgets), or ~2.5 years (video). The homepage carries a live progress bar and the bar can only point at one number. A donor comparing all three concludes the organisation does not know when its own building will be finished.
2. **Which budget figure is public?** 286M NOK (phases), 30M EUR ≈ 330M NOK (brochure), or the 100M NOK campaign goal (the donation-funded share only).
3. **Who owns and hosts the donation data**, particularly the national identity numbers? Decides hosting region, processing agreement, and who carries the liability.
4. Prayer times: API feed or entered by staff? Decides how much admin UI gets built.
5. Who updates the site after handover — prayer times, events, translations? If the answer is nobody, the architecture has to be simpler than this.
6. Is the launch date tied to a milestone (Ramadan, a construction milestone, a press moment)? Changes the build order.

Store the completion date and every campaign figure as **single tokens in one config
module**, so they can only be changed in one place and can never disagree again.
