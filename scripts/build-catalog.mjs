#!/usr/bin/env node
// Builds lib/open-library.json from Open Library's public search and works APIs.
//
//   node scripts/build-catalog.mjs              # use cached responses where present
//   node scripts/build-catalog.mjs --refresh    # refetch everything
//   node scripts/build-catalog.mjs --batches 110  # also write card-writing batches
//
// Responses are cached in scripts/.cache (gitignored) so reruns are cheap.
// Cards (hook + three ideas) live in lib/cards/*.json and are written
// separately; `--batches` lists the books that still need one.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fillOrder, sections, seeds } from "./catalog-seeds.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const cacheDir = join(here, ".cache");
const outFile = join(root, "lib", "open-library.json");
const cardsDir = join(root, "lib", "cards");
const batchDir = join(here, "card-batches");

const args = process.argv.slice(2);
const refresh = args.includes("--refresh");
const batchSize = args.includes("--batches") ? Number(args[args.indexOf("--batches") + 1]) || 110 : 0;

const UA = "QuartoCatalogBuilder/1.0 (static book catalog; github.com/eyetanvir-prog/career)";
const FIELDS = [
  "key",
  "title",
  "subtitle",
  "author_name",
  "first_publish_year",
  "cover_i",
  "edition_count",
  "readinglog_count",
  "want_to_read_count",
  "ratings_average",
  "ratings_count",
  "number_of_pages_median",
  "subject",
  "language",
  "editions",
  "editions.title",
  "editions.language",
  "editions.cover_i",
].join(",");
const PAGES_PER_SUBJECT = 3;
const MIN_READERS = 25;
const MIN_RATINGS = 8;
const MAX_PER_AUTHOR_IN_SECTION = 3;

mkdirSync(cacheDir, { recursive: true });

// ---------- fetching ----------

let active = 0;
const queue = [];
const CONCURRENCY = 6;
function limit(fn) {
  return new Promise((resolve, reject) => {
    const run = async () => {
      active++;
      try {
        resolve(await fn());
      } catch (error) {
        reject(error);
      } finally {
        active--;
        queue.shift()?.();
      }
    };
    if (active < CONCURRENCY) run();
    else queue.push(run);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let requests = 0;

async function getJSON(url) {
  const file = join(cacheDir, createHash("sha1").update(url).digest("hex") + ".json");
  if (!refresh && existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
  return limit(async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        requests++;
        const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
        if (res.status === 404) {
          writeFileSync(file, "null");
          return null;
        }
        if (!res.ok) throw new Error(`${res.status} ${url}`);
        const data = await res.json();
        writeFileSync(file, JSON.stringify(data));
        return data;
      } catch (error) {
        if (attempt === 4) {
          console.warn(`  ! giving up on ${url}: ${error.message}`);
          return null;
        }
        await sleep(2000 * 2 ** attempt);
      }
    }
  });
}

const search = (params) =>
  getJSON(`https://openlibrary.org/search.json?${new URLSearchParams({ ...params, fields: FIELDS })}`);

// ---------- cleaning ----------

const fold = (s) =>
  String(s ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const JUNK_TITLE =
  /\b(study guide|summary of|summary &|sparknotes|cliffs ?notes|notes on|workbook|box(ed)? set|boxset|collection|collected|omnibus|complete works|complete novels|books? \d|volume|vol\.|series|trilogy set|coloring|colouring|journal|planner|calendar|quotes|unofficial|analysis|companion|reader's guide|teacher|lesson plans|selections|anthology|set of|graphic novel|illustrated edition|annotated|abridged|in \d+ volumes|fundamentals|principles of|introduction to|concepts of|handbook|manual|textbook|edition|python|javascript|php|mysql|machine learning|accounting|cbse|class \d+|calculus|algorithms|programming|atlas|review of|practice of|cookbook|cooking|recipes|encyclopedia|character|dictionary|exam|question bank|statistics|grammar|patents|for dummies|idiot's guide|hands-on|data science|from scratch|action pack|excerpts?)\b|management$|biology$|\[|=|\//i;
// Titles that are popular on Open Library but do not belong on a reading list
// that recommends books: propaganda, pseudo-medicine, astrology, pickup manuals.
const BLOCK_TITLE =
  /^trick mirror$|^all good people here$|^life of pi$|random winds|hunter of the east|people's marx|rosencrantz|^fences$|diarios|michelle obama in her own words|^a child called|^the lost boy$|psychic witch|earth, air, fire|master key system|industrial society and its future|african holistic|matrices and tensors|text ?book|computer networks|research design|^foundations of|^outlines of|^sociology$|strategic marketing|naked forex|arte of warre|schachnovelle|flickan|rayuela|implementing public policy|economics of money|^the daily laws$|anne frank|diary of a young girl|love on the brain|quantum speed|you are the placebo|ageless body|mars and venus|change your brain|exercise physiology|human development|^neuroscience$|art of electronics|discrete mathematics|light on yoga|computerdenken|mein weltbild|psychologische|pedagogia|ringkasan|briefe an|sommersi|gray hat hacking|^about law$|^social psychology$|book of the dead|^anatomy$|1000 chairs|laws, etc|applied mathematics|business communications|criminalistics|criminology|criminal law|silent witness|law of attraction|silva mind|metamorphosis|dork diaries|^confidential$|^how to get rich$|millionaire mind|^limitless$|unfuck|^money$|doglapan|^the scam$|mein kampf|goebbels|kommandant in auschwitz|dark psychology|art of seduction|secret language of|^the game$|^models$|ethical slut|^pimp$|rudest book|apothecary|herbal remedies|kybalion|babywise|^the book$|no grid|bushcraft|deadly skills|5 ?a\.?m\.? club|millionaire master plan|subconscious mind|subconcious mind|the secret$|becoming supernatural|breaking the habit of being yourself|ignited minds|you can heal your life|name it and claim it|way of the superior man|no more mr\.? nice guy/i;
const BLOCK_AUTHOR = /dolores cannon|joe dispenza|deepak chopra|esther hicks|bob proctor|rhonda byrne|organization$|publishing$|press$|^team\b/i;
const JUNK_SUBJECT =
  /juvenile|children's|picture books|comic|manga|graphic novels|coloring|erotic|textbooks?|study guides|examinations|study and teaching|problems, exercises|computer programming|programming languages|data processing|cookery|astrology|horoscopes|herbs|alternative medicine|occultism|seduction|dating \(social customs\)/i;
const FICTION_SUBJECT =
  /(^|, )fiction($|,)|^fiction|novels?$|science fiction|fantasy|horror|thrillers|detective and mystery|romance|fairy tales|short stories|^poetry/i;
const NONFICTION_SIGNAL = /nonfiction|non-fiction|true crime|biography|autobiography|personal narratives/i;
const FOREIGN =
  /\b(la|el|il|der|die|das|des|du|le|les|und|von|vom|och|av|del|della|di|dei|los|las|una|uno|ein|eine|zum|zur|het|een|sobre|como|lo)\b|[^\x00-\x7F\u2018-\u201F\u2026\u2013\u2014]/i;
const SMALL_WORDS = new Set("a an and as at but by for from in into nor of on or per the to vs via with".split(" "));

function titleCase(s) {
  return s
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.,;]$/, "")
    .split(" ")
    .map((word, i, words) => {
      if (/[A-Z]/.test(word.slice(1)) || /\d/.test(word)) return word;
      const lower = word.toLowerCase();
      if (i > 0 && SMALL_WORDS.has(lower) && !/[:—-]$/.test(words[i - 1])) return lower;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

// Open Library keys a work by its original-language title. `lang=en` returns
// the best English edition alongside it; prefer that title when the work's
// own title is not English.
const tidyTitle = (t) => t.replace(/\s*\([^)]*\)\s*/g, " ").replace(/,? tr\. by.*$/i, "").replace(/[-–—:]\s*$/, "").trim();

function englishTitle(doc) {
  if (!FOREIGN.test(doc.title)) return titleCase(tidyTitle(doc.title));
  const edition = doc.editions?.docs?.[0];
  const alt = edition?.language?.includes("eng") ? edition.title : null;
  if (alt && !FOREIGN.test(alt) && alt.length <= 70 && !JUNK_TITLE.test(alt)) return titleCase(tidyTitle(alt));
  return null;
}
const NOISY_SUBJECT =
  /nyt:|accessible book|protected daisy|in library|lending library|overdrive|large type|open_syllabus|reading level|long now|new york times|bestseller|internet archive|translations into|^fiction, general$|award|=|:|\d{4}-\d{4}|^general$|^history and criticism$|^english$/i;

function cleanSubjects(list = []) {
  const out = [];
  const seen = new Set();
  for (const raw of list) {
    const s = String(raw).replace(/\s+/g, " ").trim();
    if (!s || s.length > 38 || NOISY_SUBJECT.test(s)) continue;
    const pretty = s.charAt(0).toUpperCase() + s.slice(1);
    const k = fold(pretty);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(pretty);
    if (out.length >= 8) break;
  }
  return out;
}

function cleanDescription(value) {
  let text = typeof value === "string" ? value : value?.value;
  if (!text) return null;
  text = text
    .replace(/\r/g, "")
    .split(/\n-{3,}|\n\*{3,}|\nContains:|\n\[1\]:|\nSee also/i)[0]
    .replace(/\[([^\]]+)\]\[\d+\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\(\[source\]\[\d+\]\)|\(source:[^)]*\)/gi, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_#>]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length < 60) return null;
  if (text.length > 520) {
    const cut = text.slice(0, 520);
    const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
    text = stop > 220 ? cut.slice(0, stop + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}…`;
  }
  return text;
}

const slugify = (s) =>
  fold(s)
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");

const titleKey = (title, author) =>
  `${fold(title)
    .split(/[:;(]/)[0]
    .replace(/ and other (essays|stories|writings)$/, "")
    .replace(/^(the|a|an) /, "")
    .replace(/[^a-z0-9]/g, "")}|${fold(author).split(/\s+/).pop().slice(0, 4)}`;

function isLatin(s) {
  return !/[^\u0000-\u024F\u2018-\u201F\u2026\u2013\u2014]/.test(s);
}

function acceptable(doc, section) {
  const author = doc.author_name?.[0];
  if (!author || !doc.title || !isLatin(author) || BLOCK_AUTHOR.test(author)) return false;
  const title = englishTitle(doc);
  if (!title || JUNK_TITLE.test(doc.title) || BLOCK_TITLE.test(title) || title.length > 80) return false;
  doc.title = title;
  if (/various|anonymous|unknown/i.test(author)) return false;
  if ((doc.readinglog_count ?? 0) < MIN_READERS || (doc.ratings_count ?? 0) < MIN_RATINGS) return false;
  if (doc.language && !doc.language.includes("eng")) return false;
  const subjects = doc.subject ?? [];
  if (subjects.some((s) => JUNK_SUBJECT.test(s))) return false;
  if (section.exclude && subjects.some((s) => section.exclude.test(s))) return false;
  if (subjects.filter((s) => section.require?.test(s) ?? true).length < (section.requireCount ?? 1)) return false;
  if (!section.fiction) {
    const fictionHits = subjects.filter((s) => FICTION_SUBJECT.test(s) && !/non-?fiction/i.test(s)).length;
    // Open Library's subjects are crowd-tagged; reported books often carry a
    // stray "Fiction" tag, so only the narrative shelves get the benefit of the doubt.
    const lenient = section.slug === "true-story" || section.slug === "biography";
    if (fictionHits >= 1 && !(lenient && subjects.some((s) => NONFICTION_SIGNAL.test(s)))) return false;
    if (fictionHits >= 3) return false;
  }
  return true;
}

// ---------- build ----------

const chosen = new Map();
const byTitle = new Set();
const slugs = new Set();

function record(doc, sectionSlug, opts = {}) {
  const author = doc.author_name[0];
  const keys = [titleKey(doc.title, author), titleKey(opts.title ?? doc.title, author)];
  if (chosen.has(doc.key) || keys.some((k) => byTitle.has(k))) return false;
  let slug = opts.slug ?? slugify((opts.curated ? opts.title : doc.title).split(/[:;(]/)[0]);
  if (!opts.slug && slugs.has(slug)) slug = `${slug}-${slugify(author.split(/\s+/).pop())}`;
  for (let n = 2; slugs.has(slug); n++) slug = `${slug.replace(/-\d+$/, "")}-${n}`;
  slugs.add(slug);
  keys.forEach((k) => byTitle.add(k));
  chosen.set(doc.key, {
    slug,
    section: sectionSlug,
    key: doc.key,
    title: opts.title ?? doc.title,
    author,
    coAuthors: (doc.author_name ?? []).slice(1, 3).filter((a) => a !== author),
    year: doc.first_publish_year ?? null,
    pages: doc.number_of_pages_median ?? null,
    // A work's own cover can come from any edition (often a translation);
    // prefer the best-matching English edition's cover when there is one.
    coverId: (doc.editions?.docs?.[0]?.language?.includes("eng") && doc.editions.docs[0].cover_i) || doc.cover_i || null,
    readers: doc.readinglog_count ?? 0,
    rating: doc.ratings_average ? Math.round(doc.ratings_average * 10) / 10 : null,
    ratings: doc.ratings_count ?? 0,
    editions: doc.edition_count ?? 0,
    subjects: cleanSubjects(doc.subject),
    curated: Boolean(opts.curated),
    description: null,
  });
  return true;
}

// Open Library's `title=` search ranks badly; a free-text query on title plus
// author surname finds the canonical work, which is often titled in its
// original language. Curated entries keep their English display title.
async function resolveSeed([title, match, opts = {}]) {
  const res = opts.key
    ? await search({ q: `key:"${opts.key}"`, lang: "en" })
    : await search({ q: opts.q ?? `${(opts.title ?? title).replace(/[:,'’!?]/g, " ")} ${match}`, lang: "en", limit: "20" });
  const docs = (res?.docs ?? []).filter(
    (d) =>
      d.author_name?.length &&
      !JUNK_TITLE.test(d.title) &&
      (opts.key || d.author_name.some((a) => fold(a).includes(match))),
  );
  docs.sort((a, b) => (b.readinglog_count ?? 0) - (a.readinglog_count ?? 0));
  const doc = docs[0];
  if (!doc) return null;
  const credited = opts.author ?? doc.author_name.find((a) => fold(a).includes(match)) ?? doc.author_name[0];
  doc.author_name = [credited, ...doc.author_name.filter((a) => a !== credited && isLatin(a))];
  return doc;
}

async function main() {
  console.log("Resolving curated seeds…");
  const misses = [];
  for (const section of sections) {
    const list = seeds[section.slug] ?? [];
    const docs = await Promise.all(list.map(resolveSeed));
    docs.forEach((doc, i) => {
      const [title, , opts = {}] = list[i];
      if (!doc) return misses.push(`${section.slug}: ${title}`);
      record(doc, section.slug, { ...opts, title, curated: true });
    });
  }
  if (misses.length) console.log(`  ${misses.length} seeds not found:\n   - ${misses.join("\n   - ")}`);

  console.log("Filling sections from subject searches…");
  for (const section of fillOrder.map((slug) => sections.find((s) => s.slug === slug))) {
    if (!section.target) continue;
    const pages = await Promise.all(
      section.subjects.flatMap((subject) =>
        Array.from({ length: PAGES_PER_SUBJECT }, (_, p) =>
          search({ q: `subject:"${subject}" language:eng`, sort: "readinglog", lang: "en", limit: "100", page: String(p + 1) }),
        ),
      ),
    );
    const pool = new Map();
    for (const res of pages) for (const doc of res?.docs ?? []) if (!pool.has(doc.key)) pool.set(doc.key, doc);
    const candidates = [...pool.values()]
      .filter((doc) => acceptable(doc, section))
      .sort((a, b) => (b.readinglog_count ?? 0) - (a.readinglog_count ?? 0));
    const perAuthor = new Map();
    for (const book of chosen.values())
      if (book.section === section.slug) perAuthor.set(book.author, (perAuthor.get(book.author) ?? 0) + 1);
    let count = [...chosen.values()].filter((b) => b.section === section.slug).length;
    for (const doc of candidates) {
      if (count >= section.target) break;
      const author = doc.author_name[0];
      if ((perAuthor.get(author) ?? 0) >= MAX_PER_AUTHOR_IN_SECTION) continue;
      if (record(doc, section.slug)) {
        perAuthor.set(author, (perAuthor.get(author) ?? 0) + 1);
        count++;
      }
    }
    console.log(`  ${section.label.padEnd(26)} ${count}`);
  }

  console.log(`Fetching work descriptions for ${chosen.size} books…`);
  let done = 0;
  await Promise.all(
    [...chosen.values()].map(async (book) => {
      const work = await getJSON(`https://openlibrary.org${book.key}.json`);
      book.description = cleanDescription(work?.description);
      if (!book.subjects.length && work?.subjects) book.subjects = cleanSubjects(work.subjects);
      if (++done % 100 === 0) console.log(`  ${done}`);
    }),
  );

  const order = new Map(sections.map((s, i) => [s.slug, i]));
  const books = [...chosen.values()].sort(
    (a, b) => order.get(a.section) - order.get(b.section) || Number(b.curated) - Number(a.curated) || b.readers - a.readers,
  );
  const out = {
    source: "Open Library (openlibrary.org) search and works APIs",
    fetched: new Date().toISOString().slice(0, 10),
    sections: sections.map(({ slug, label, line, fiction }) => ({
      slug,
      label,
      line,
      fiction,
      count: books.filter((b) => b.section === slug).length,
    })),
    books,
  };
  writeFileSync(outFile, JSON.stringify(out, null, 1) + "\n");
  console.log(`Wrote ${books.length} books to ${outFile} (${requests} network requests).`);
  for (const s of out.sections) console.log(`  ${s.label.padEnd(26)} ${s.count}`);

  if (batchSize) writeBatches(books);
}

function writeBatches(books) {
  const have = new Set();
  if (existsSync(cardsDir))
    for (const f of readdirSync(cardsDir).filter((f) => f.endsWith(".json")))
      for (const slug of Object.keys(JSON.parse(readFileSync(join(cardsDir, f), "utf8")))) have.add(slug);
  const missing = books.filter((b) => !have.has(b.slug));
  mkdirSync(batchDir, { recursive: true });
  for (let i = 0; i * batchSize < missing.length; i++) {
    const slice = missing.slice(i * batchSize, (i + 1) * batchSize).map((b) => ({
      slug: b.slug,
      title: b.title,
      author: b.author,
      year: b.year,
      section: b.section,
      subjects: b.subjects,
      description: b.description,
    }));
    writeFileSync(join(batchDir, `batch-${String(i + 1).padStart(2, "0")}.json`), JSON.stringify(slice, null, 1));
  }
  console.log(`${missing.length} books need cards; batches written to ${batchDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
