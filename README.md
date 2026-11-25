# Quarto

Quarto is a Next.js reading room: a catalog of **1,054** widely read books in eleven sections. Every book has an original card (a one-line hook and three key ideas). **47** must-reads also have a full four-minute essay. A five-question quiz on the homepage recommends five books and explains why each fits. Catalog facts and covers come from [Open Library](https://openlibrary.org); there is no database and no login. Quiz answers stay in `localStorage`.

Nothing here reuses text from Four Minute Books or any other summary site.

Each full essay has a calm English reading in `public/audio/` (Piper’s Lessac voice, unhurried). The essay page has play, pause, and a progress bar. A **বাংলা / English** switch, stored in `localStorage`, shows an original Bangla text of those essays — titles, hooks, and key ideas included. Cards without an essay stay in English; the switch says Bangla is on the essays. English is the default.

## Live site

After merge and a green **Deploy Quarto (GitHub Pages)** workflow run:

**https://eyetanvir-prog.github.io/book-summary/**

The app is a static export with `basePath` `/book-summary`, so all routes live under that prefix on GitHub Pages.

## Run locally

```bash
cd apps/book-summaries
npm install
npm run dev
```

Open http://localhost:3000 (no `basePath` in dev).

Production-style static build:

```bash
npm run build
# output in out/ — for a GitHub Pages dry run:
GITHUB_PAGES=true npm run build
npx serve out   # then open http://localhost:3000/book-summary/
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
| `lib/bangla/*.json` | Bangla text for those essays |
| `public/audio/*.mp3` | English readings of the essays |
| `lib/catalog.ts` | Merge, ranking, search, quiz pool |

## Routes

- `/` — quiz, catalog totals by section, must-reads, section grid
- `/sections`, `/sections/[slug]`, `/sections/[slug]/page/[n]` — top picks plus full shelf (48 per page, visible “1–48 of 185” pager)
- `/must-reads` — every book with a full essay
- `/books/[slug]` — essay or card plus “full essay coming”
- `/search` — client search over the whole catalog (query `?q=&section=&page=`)
- `/about`

## Deploy

GitHub Actions workflow: [`.github/workflows/quarto-pages.yml`](../../.github/workflows/quarto-pages.yml). It sets `GITHUB_PAGES=true`, runs `npm run build` in this folder, and publishes `out/` to GitHub Pages. The workflow pushes the `out/` folder to the **`gh-pages`** branch. In the repo, open **Settings → Pages** and set the source to **Deploy from branch** → **`gh-pages`** → **`/`** (once). After that, each green workflow run updates the live site.