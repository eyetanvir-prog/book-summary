import Link from "next/link";
import { LTitle } from "@/components/Language";
import { getBooks, sections, topPicks } from "@/lib/catalog";

export const metadata = { title: "Sections — Quarto" };

export default function SectionsPage() {
  return (
    <main className="shell block">
      <header className="page-intro">
        <p className="kicker">Browse · {getBooks().length.toLocaleString("en-US")} books</p>
        <h1>Eleven ways in.</h1>
        <p className="lede">
          Every book sits on one shelf. Each shelf opens with its top picks, then the full list, most-read first.
        </p>
      </header>
      <div className="section-grid">
        {sections.map((section) => (
          <Link className="section-card" href={`/sections/${section.slug}`} key={section.slug}>
            <div>
              <p className="kicker">{section.count} books</p>
              <h3>{section.label}</h3>
              <p>{section.line}</p>
            </div>
            <ul>
              {topPicks(section.slug, 3).map((book) => (
                <li key={book.slug}>
                  <LTitle slug={book.slug}>{book.title}</LTitle>
                  <small>{book.author}</small>
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </main>
  );
}
