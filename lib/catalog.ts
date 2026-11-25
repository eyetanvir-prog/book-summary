import raw from "./open-library.json";
import { cards } from "./cards";
import { essays, type Essay } from "./essays";

export type Section = {
  slug: string;
  label: string;
  line: string;
  fiction: boolean;
  count: number;
};

type RawBook = {
  slug: string;
  section: string;
  key: string;
  title: string;
  author: string;
  coAuthors: string[];
  year: number | null;
  pages: number | null;
  coverId: number | null;
  readers: number;
  rating: number | null;
  ratings: number;
  editions: number;
  subjects: string[];
  curated: boolean;
  description: string | null;
};

type Catalog = { source: string; fetched: string; sections: Section[]; books: RawBook[] };

export type Book = Omit<RawBook, "editions" | "curated"> & {
  hook: string;
  ideas: string[];
  hasCard: boolean;
  essay: Essay | null;
  mustRead: boolean;
  minutes: number;
  words: number;
  wash: string;
  ink: string;
  motif: Essay["motif"];
  coverUrl: string | null;
  thumbUrl: string | null;
  openLibraryUrl: string;
  score: number;
};

const catalog = raw as unknown as Catalog;

export const catalogFetched = catalog.fetched;
export const sections: Section[] = catalog.sections;

const palettes: Record<string, [string, string]> = {
  thriller: ["#121317", "#7a1f1f"],
  fiction: ["#1c2430", "#8d5a3c"],
  "non-fiction": ["#1f2a24", "#5a7d6a"],
  islamic: ["#0f2a24", "#b08a3e"],
  "true-story": ["#1b1a18", "#6b5b45"],
  "self-help": ["#23324a", "#c2411c"],
  business: ["#14213d", "#3f6c8c"],
  history: ["#2b1d14", "#9a6b3f"],
  science: ["#0d1b2a", "#2f6f8f"],
  biography: ["#2a1f2d", "#8c5a7a"],
  philosophy: ["#1c2430", "#6d6a4f"],
};
const motifs: Essay["motif"][] = ["rings", "bars", "grid", "arc"];

function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}

function countWords(essay: Essay) {
  return [essay.hook, ...essay.takeaways, ...essay.sections.flatMap((s) => [s.heading, ...s.paragraphs])]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function firstSentence(text: string | null) {
  if (!text) return null;
  const match = text.match(/^(.{40,220}?[.!?])(\s|$)/);
  return match ? match[1] : null;
}

const essayBySlug = new Map(essays.map((essay) => [essay.slug, essay]));

const books: Book[] = catalog.books.map((record) => {
  const essay = essayBySlug.get(record.slug) ?? null;
  const card = cards[record.slug];
  const h = hash(record.slug);
  const [deep, mid] = palettes[record.section] ?? palettes.fiction;
  const words = essay ? countWords(essay) : 0;
  const { editions: _editions, curated, ...rest } = record;
  const score =
    Math.log10(record.readers + 10) +
    (record.rating && record.ratings >= 20 ? (record.rating - 3.6) * 0.8 : 0) +
    (curated ? 0.7 : 0) +
    (essay ? 4 : 0);
  return {
    ...rest,
    title: essay?.title ?? record.title,
    author: essay?.authorCredit ?? record.author,
    hook:
      essay?.hook ??
      card?.hook ??
      firstSentence(record.description) ??
      `${record.title}, by ${record.author}. Card in progress.`,
    ideas: card?.ideas ?? essay?.takeaways.slice(0, 3) ?? [],
    hasCard: Boolean(card),
    essay,
    mustRead: Boolean(essay),
    words,
    minutes: essay ? Math.max(1, Math.round(words / 220)) : 1,
    wash: essay?.wash ?? `linear-gradient(160deg, ${deep} 0%, ${mid} 62%, ${h % 3 === 0 ? "#d6ff3c" : mid} 150%)`,
    ink: essay?.ink ?? "#f4efe4",
    motif: essay?.motif ?? motifs[h % motifs.length],
    coverUrl: record.coverId ? `https://covers.openlibrary.org/b/id/${record.coverId}-L.jpg` : null,
    thumbUrl: record.coverId ? `https://covers.openlibrary.org/b/id/${record.coverId}-M.jpg` : null,
    openLibraryUrl: `https://openlibrary.org${record.key}`,
    score,
  };
});

const bySlug = new Map(books.map((book) => [book.slug, book]));
const bySection = new Map<string, Book[]>(
  sections.map((section) => [
    section.slug,
    books.filter((book) => book.section === section.slug).sort((a, b) => b.score - a.score),
  ]),
);

export function getBooks() {
  return books;
}

export function getBook(slug: string) {
  return bySlug.get(slug) ?? null;
}

export function sectionBySlug(slug: string) {
  return sections.find((section) => section.slug === slug) ?? null;
}

export function booksInSection(slug: string) {
  return bySection.get(slug) ?? [];
}

export function topPicks(slug: string, limit = 8) {
  return booksInSection(slug).slice(0, limit);
}

export function mustReads() {
  return books.filter((book) => book.mustRead);
}

/** Must-reads interleaved across sections so no one shelf dominates. */
export function featuredMustReads(limit = 8) {
  const queues = sections.map((section) => booksInSection(section.slug).filter((b) => b.mustRead));
  const out: Book[] = [];
  for (let round = 0; out.length < limit && queues.some((q) => q.length > round); round++)
    for (const queue of queues) if (queue[round] && out.length < limit) out.push(queue[round]);
  return out;
}

export const PER_PAGE = 48;

export function sectionPage(slug: string, page: number) {
  const all = booksInSection(slug);
  const pages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  return { pages, books: all.slice((page - 1) * PER_PAGE, page * PER_PAGE), total: all.length };
}

export function relatedBooks(book: Book, limit = 5) {
  const subjects = new Set(book.subjects.map((s) => s.toLowerCase()));
  return booksInSection(book.section)
    .filter((other) => other.slug !== book.slug)
    .map((other) => ({
      other,
      rank: other.subjects.filter((s) => subjects.has(s.toLowerCase())).length + other.score * 0.4,
    }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, limit)
    .map((item) => item.other);
}

const fold = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .toLowerCase();

const index = books.map((book) => ({
  book,
  title: fold(book.title),
  author: fold([book.author, ...book.coAuthors].join(" ")),
  subjects: fold(book.subjects.join(" ")),
  text: fold([book.hook, ...book.ideas, book.description ?? ""].join(" ")),
}));

export function searchBooks(query: string, section?: string) {
  const needle = fold(query.trim());
  const tokens = needle.split(/\s+/).filter(Boolean);
  const pool = section ? index.filter((entry) => entry.book.section === section) : index;
  if (!tokens.length) return pool.map((entry) => entry.book).sort((a, b) => b.score - a.score);
  const results: { book: Book; rank: number }[] = [];
  for (const entry of pool) {
    let rank = 0;
    let matched = true;
    for (const token of tokens) {
      const hit =
        (entry.title.includes(token) ? 6 : 0) +
        (entry.author.includes(token) ? 4 : 0) +
        (entry.subjects.includes(token) ? 2 : 0) +
        (entry.text.includes(token) ? 1 : 0);
      if (!hit) {
        matched = false;
        break;
      }
      rank += hit;
    }
    if (!matched) continue;
    if (entry.title === needle) rank += 12;
    else if (entry.title.startsWith(needle)) rank += 5;
    results.push({ book: entry.book, rank: rank + entry.book.score * 0.5 });
  }
  return results.sort((a, b) => b.rank - a.rank).map((r) => r.book);
}

export type QuizBook = {
  slug: string;
  title: string;
  author: string;
  section: string;
  fiction: boolean;
  pages: number | null;
  hook: string;
  mustRead: boolean;
  minutes: number;
  thumbUrl: string | null;
  wash: string;
  ink: string;
  weight: number;
};

/** A slim, client-safe pool for the homepage questionnaire. */
export function quizPool(perSection = 18): QuizBook[] {
  return sections.flatMap((section) =>
    booksInSection(section.slug)
      .slice(0, perSection)
      .map((book) => ({
        slug: book.slug,
        title: book.title,
        author: book.author,
        section: book.section,
        fiction: section.fiction,
        pages: book.pages,
        hook: book.hook,
        mustRead: book.mustRead,
        minutes: book.minutes,
        thumbUrl: book.thumbUrl,
        wash: book.wash,
        ink: book.ink,
        weight: Math.round(book.score * 100) / 100,
      })),
  );
}
