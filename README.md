# Quarto (book-summary)

Quarto is a Next.js reading room: a catalog of **1,054** widely read books in eleven sections. Every book has an original card (a one-line hook and three key ideas). **47** must-reads also have a full four-minute essay. A five-question quiz on the homepage recommends five books and explains why each fits. Catalog facts and covers come from [Open Library](https://openlibrary.org); there is no database and no login. Quiz answers stay in `localStorage`.

Nothing here reuses text from Four Minute Books or any other summary site.

## Live site

**https://eyetanvir-prog.github.io/book-summary/**

GitHub Pages serves this repo as a **project site**, so routes use `basePath` **`/book-summary`** (set when `GITHUB_PAGES=true` at build time).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 (no `basePath` in dev).

Production-style static build:

```bash
npm run build
GITHUB_PAGES=true npm run build
npx serve out   # open http://localhost:3000/book-summary/
```

`npm run build` statically generates every book, section page, and paginated shelf (48 books per page).

## Catalog script

The catalog is built from Open Library and written to `lib/open-library.json`:

```bash
npm run catalog                 # rebuild from cached API responses (scripts/.cache/)
npm run catalog -- --refresh    # ignore cache and refetch
npm run catalog -- --batches 100  # also write books missing cards to scripts/card-batches/
```

Section rules and curated seeds (especially the Islamic shelf) live in `scripts/catalog-seeds.mjs`. The builder is `scripts/build-catalog.mjs`. Do not edit `open-library.json` by hand.

After a rebuild, add cards in `lib/cards/batch-NN.json` and import them in `lib/cards/index.ts`. Essays live in `lib/essays/*.ts` with slugs matching the catalog.

## Layout

| Path | What |
|------|------|
| `lib/open-library.json` | Generated catalog |
| `lib/cards/*.json` | Original short cards |
| `lib/essays/*.ts` | Original four-minute essays |
| `lib/catalog.ts` | Merge, ranking, search, quiz pool |

## Routes

- `/` — quiz, catalog totals by section, must-reads, section grid
- `/sections`, `/sections/[slug]`, `/sections/[slug]/page/[n]` — top picks plus full shelf (48 per page, visible “1–48 of 185” pager)
- `/must-reads` — every book with a full essay
- `/books/[slug]` — essay or card plus “full essay coming”
- `/search` — client search over the whole catalog (query `?q=&section=&page=`)
- `/about`

## Deploy

[`.github/workflows/quarto-pages.yml`](.github/workflows/quarto-pages.yml) builds with `GITHUB_PAGES=true` and pushes `out/` to the **`gh-pages`** branch.

One-time: **Settings → Pages → Deploy from a branch → `gh-pages` / `/` → Save**. Each green workflow run on `main` updates the live site.

The same app also lives in the [career](https://github.com/eyetanvir-prog/career) monorepo under `apps/book-summaries`; **this repo** is the public home at `/book-summary` on GitHub Pages.