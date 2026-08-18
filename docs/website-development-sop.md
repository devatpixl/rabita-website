# Standard Operating Procedure

## Building a website in Next.js

How we take a website from the first client meeting to handover. Read it once before you start, then use it as a checklist.

Stack is Next.js App Router, TypeScript and Tailwind, the same every time unless there is a written reason not to.

## 1. Purpose (Hensikt)

So that every site we ship is legal, accessible and fast, without depending on who happened to build it. Accessibility and privacy are designed in from day one here, because bolting them on at the end is what makes projects overrun.

## 2. Scope (Omfang)

New sites, rebuilds and major redesigns. From the first meeting to thirty days after launch.

Not covered: hosting operations, ad campaigns, native apps. Those have their own procedures.

## 3. Who does what (Ansvar)

| Role | Owns |
| --- | --- |
| Project lead | The plan, the gates, the risk log, and this procedure being followed |
| Designer | Structure, wireframes, design tokens, contrast checks |
| Developer | The build, performance, accessibility in code, deployment |
| Content editor | Copy, translations, alt text, metadata |
| Data protection contact | Privacy assessment, processor agreement, consent design |
| Tester | Test log, accessibility audit, device checks |
| Client contact | Requirements, content, and signing each gate |

## 4. The steps (Fremgangsmåte)

Nine steps. Do not start the next one until the previous one is signed off.

### Step 1. Take the brief

- Ask what the site is for, and get it down to one sentence and one number you will judge it by.
- Write down every kind of personal data the site will touch. If any of it is sensitive, start the privacy assessment now, not later.
- Agree the languages on day one. Adding a second language after the build costs several times more than planning for it.

### Step 2. Look at what exists

- Audit the current site: pages, traffic, speed, accessibility, and every domain in use.
- List what is broken and what is worth keeping. Clients often assume everything must go, and that is rarely true.

### Step 3. Agree the structure

- Draw the sitemap and the one journey that matters most, usually the one that ends in a form or a payment.
- Wireframe the key templates in grey, with no styling. Structure gets judged on its own before anyone argues about colour.

### Step 4. Set the design tokens first

- Decide colour, type scale, spacing scale and breakpoints before drawing any screen.
- Check every text and background pair for contrast now. Fixing a token is minutes. Fixing forty components is days.
- Design the empty, loading and error state of anything that loads or submits. People hit those states as often as the happy path.

### Step 5. Set up the Next.js project

Start from the standard setup so every project looks the same to the next developer:

```bash
npx create-next-app@latest my-site --ts --tailwind --app --eslint --src-dir
```

```
src/app/[locale]/       one folder per language, layout.tsx sets lang and dir
src/components/         one file per component, no page specific dumping ground
src/lib/i18n/           all copy, one file per language, typed off the default
src/app/globals.css     design tokens in @theme, nothing hardcoded elsewhere
public/                 images, fonts, video
```

Put every string in the language files, even on a single language site. Pulling text back out of components later takes days.

### Step 6. Build it

- Build components, not pages. Pages are assembled from components.
- Never hardcode a colour or a spacing value. If it is not a token, it does not go in.
- Semantic HTML first. Every control reachable by keyboard, every field with a real label.
- Images through `next/image` with width and height set, so the layout does not jump.
- Nothing from a third party loads before the visitor has given consent.
- Every merge is read by a second person before it lands.

### Step 7. Test it properly

- Run every form, in every language, all the way to the end.
- Accessibility: run the automated scan first, then do a manual keyboard and screen reader pass. The scanner finds about a third of real problems.
- Check speed on a throttled mobile connection, not on your own machine.
- Have each language proofread by somebody who speaks it natively.
- Confirm no tracking fires before consent is given.

### Step 8. Launch

- Freeze content. Take a backup. Time the rollback so you know it works.
- Redirect every old address. Broken links are the most common thing to go wrong at launch.
  Take the list from the old sitemap rather than from the menu, because pages drop out of a
  menu long before they stop being linked to. Use permanent redirects, send each address to the
  page that actually replaces it, and never point a pile of unrelated ones at the front page.
  Where nothing replaces a page yet, say so and put it on the list to build.
- Publish the privacy policy and accessibility statement at the same moment as the site.
- Launch outside office hours, with a developer free for two hours afterwards.
- Within the hour, check forms, payments, search indexing and certificates.

### Step 9. Hand it over

- Write a short manual for the people who will update the site, in their language.
- Train the editors and record the session, so the next person can watch it.
- Pass credentials through a password manager. Never by email.
- Thirty days of warranty for anything broken at launch.
- Hold a retrospective and fold what you learned back into this document.

## 5. Definition of done

A thing is finished only when all of this is true. Checked at step 7.

| Area | Rule |
| --- | --- |
| Accessibility | WCAG 2.1 AA. Contrast 4.5:1 on body text, 3:1 on large text and on controls. Visible focus everywhere. Full keyboard use. Real labels. Alt text on meaningful images. |
| Responsive | Works at 360, 390, 412, 768, 1024 and 1440. No sideways scroll. Tap targets 44 px. Test a tall phone as well as a short one, since spacing tied to screen height breaks on one and not the other. |
| Speed | Largest paint under 2.5s on throttled mobile. Layout shift under 0.1. No autoplaying video in the first screen. |
| Privacy | No cookie or tracker before consent. Withdrawing consent is as easy as giving it. |
| Content | Proofread natively. Title, description and one H1 on every page, different on every page. |
| Found | A sitemap and a robots file. A canonical address on every page. If the site is in more than one language, every page names its translations, and they name it back. |
| Figures | Every number on the site traces to something published, and the source is named where a reader can check it. Numbers live in one file, not in the copy. |
| Code | Reviewed by a second person. No hardcoded colours or spacing. Builds with no warnings. |

## 6. Norwegian rules that apply

- Universell utforming. Public facing sites must meet WCAG. Enforced by Tilsynet for universell utforming av IKT.
- GDPR, through personopplysningsloven. Norway is in the EEA, so it applies fully. Datatilsynet supervises.
- Cookies, under ekomloven. Consent before anything non essential is stored or tracked.
- Markedsføringsloven. Covers marketing claims, newsletters and prize draws.

## 7. When something goes wrong (Avvik)

| How bad | Example | What to do |
| --- | --- | --- |
| Critical | Personal data exposed, site down, tracking without consent | Stop. Tell the owner the same day. If personal data leaked, Datatilsynet must be told within 72 hours of you finding out. |
| Major | Accessibility failure found after launch, payment path broken | Log it, fix within five working days, record the cause in the retrospective. |
| Minor | Typo, spacing, missing alt text on a decorative image | Log it, fix in the next release. |

## 8. What to keep (Dokumentasjon)

| Record | Keep for |
| --- | --- |
| Signed brief and gate approvals | 5 years |
| Design tokens and contrast report | Life of the site |
| Test log and accessibility report | 5 years |
| Privacy assessment and processor agreement | Length of processing, plus 5 years |
| Handover manual and training recording | Life of the site |
| Retrospective notes | 3 years |

If a step here does not work in practice, say so and we will change it. A procedure nobody follows is worse than no procedure.
