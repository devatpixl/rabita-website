# rabita-website

The website for Det Islamske Forbundet (Rabita) in Oslo, built around the
appeal for the new cultural centre and mosque in Calmeyers gate 8.

Norwegian, English and Arabic, with Arabic running right to left.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. It redirects to `/no`, `/en` or `/ar`.

```bash
npm run build       # production build
npm run typecheck   # types
npx eslint .        # lint
```

No environment variables are needed to build. `DATABASE_URL` in `.env.example`
is only read by `prisma generate`; the giving flow uses a stub and does not
touch Prisma.

## Where things are

```
app/[locale]/          one folder per page
app/api/               route handlers, currently stubs
components/            one file per component
messages/              all copy, one file per language
prisma/                schema, not wired to the site yet
docs/                  the SOP and the script that builds its Word copy
SPEC.md                the original build specification
```

## Two things worth knowing before changing anything

**All copy lives in `messages/`.** Three files, same shape, 670 keys each.
Nothing user facing should be written into a component. When you add a key,
add it to all three.

**The layout has two measures on purpose.** Sections use `max-w-6xl px-6`.
The hero is wider with a narrower gutter, because a full bleed photograph
with a card on it carries more width than a column of prose does. Do not
"fix" one to match the other without deciding which you want.

## The SOP

`docs/website-development-sop.md` is the source. The Word copy people open is
built from it:

```bash
python docs/build-sop-docx.py
```

Run that after editing the Markdown, so the two do not drift.

## Branches

`main` is the original build. Work for the merged site happens on
`redesign-by-talha`, which has its own Vercel deployment. See
`docs/redesign-notes.md` for what that branch changes.
