import Link from "next/link";
import { TileGrid } from "@/components/BookTile";
import { booksInSection, mustReads, sections } from "@/lib/catalog";

export const metadata = { title: "Must-reads — Quarto" };

export default function MustReadsPage() {
  return (
    <main className="shell block">
      <header className="page-intro">
        <p className="kicker">Must-reads · {mustReads().length} full essays</p>
        <h1>The long reads.</h1>
        <p className="lede">
          The books worth four uninterrupted minutes: each has a full original essay on top of its card.
          Grouped by section, best known first.
        </p>
      </header>
      {sections.map((section) => {
        const books = booksInSection(section.slug).filter((book) => book.mustRead);
        if (!books.length) return null;
        return (
          <section className="picks" key={section.slug}>
            <div className="shelf-head">
              <h2>{section.label}</h2>
              <Link className="kicker head-link" href={`/sections/${section.slug}`}>
                All {section.count} in {section.label} →
              </Link>
            </div>
            <TileGrid books={books} />
          </section>
        );
      })}
    </main>
  );
}
