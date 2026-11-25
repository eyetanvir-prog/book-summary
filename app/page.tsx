import Link from "next/link";
import { TileGrid } from "@/components/BookTile";
import { Cover } from "@/components/Cover";
import { Quiz } from "@/components/Quiz";
import { featuredMustReads, getBook, getBooks, mustReads, quizPool, sections, topPicks } from "@/lib/catalog";

export default function HomePage() {
  const total = getBooks().length;
  const essays = mustReads().length;
  const lead = getBook("frankenstein") ?? mustReads()[0];
  const featured = featuredMustReads(10).filter((book) => book.slug !== lead.slug).slice(0, 8);

  return (
    <main>
      <section className="shell hero">
        <p className="kicker">
          A reading room · {total.toLocaleString("en-US")} books · {sections.length} sections · {essays} full essays
        </p>
        <h1>Read the book you keep meaning to start.</h1>
        <div className="hero-row">
          <p className="lede">
            Quarto is a catalog of widely read books, each with an original card: one line on why it matters
            and three ideas worth keeping. The must-reads get a full four-minute essay. Catalog facts and
            covers come from Open Library and live in the files, so nothing here needs a database.
          </p>
          <p className="stat">
            <a href="#quiz">Not sure where to start? Five questions →</a>
          </p>
        </div>
        <div className="catalog-strip" aria-label="Catalog size">
          <p className="catalog-total">
            <span className="catalog-total-num">{total.toLocaleString("en-US")}</span>
            <span className="catalog-total-label">books in the catalog</span>
          </p>
          <ul className="catalog-counts">
            {sections.map((section) => (
              <li key={section.slug}>
                <Link href={`/sections/${section.slug}`}>
                  <span className="catalog-count-num">{section.count}</span>
                  <span className="catalog-count-name">{section.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="shell">
        <Quiz pool={quizPool()} sections={sections.map(({ slug, label, fiction }) => ({ slug, label, fiction }))} />
      </div>

      <div className="shell topic-rail">
        {sections.map((section) => (
          <Link className="chip" href={`/sections/${section.slug}`} key={section.slug}>
            {section.label}
            <span className="chip-count">{section.count}</span>
          </Link>
        ))}
      </div>

      <article className="feature">
        <Cover title={lead.title} coverUrl={lead.coverUrl} wash={lead.wash} ink={lead.ink} motif={lead.motif} />
        <Link href={`/books/${lead.slug}`}>
          <div className="feature-copy">
            <span className="tag">Start here</span>
            <h2>{lead.title}</h2>
            <p>{lead.hook}</p>
            <p>
              {lead.author}
              {lead.year ? ` · catalog year ${lead.year}` : ""} · {lead.minutes} min
            </p>
          </div>
        </Link>
      </article>

      <section className="shell block">
        <div className="shelf-head">
          <h2>Must-reads</h2>
          <Link className="kicker head-link" href="/must-reads">
            All {essays} essays →
          </Link>
        </div>
        <TileGrid books={featured} showSection />
      </section>

      <section className="shell block">
        <div className="shelf-head">
          <h2>Browse by section</h2>
          <Link className="kicker head-link" href="/sections">
            All sections →
          </Link>
        </div>
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
                    {book.title}
                    <small>{book.author}</small>
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
