import Link from "next/link";
import { TileGrid } from "@/components/BookTile";
import { Pagination } from "@/components/Pagination";
import { Shelf } from "@/components/Shelf";
import { PER_PAGE, sectionPage, sections, topPicks, type Section } from "@/lib/catalog";

export function SectionView({ section, page }: { section: Section; page: number }) {
  const { books, pages, total } = sectionPage(section.slug, page);
  const href = (n: number) => (n === 1 ? `/sections/${section.slug}` : `/sections/${section.slug}/page/${n}`);
  const essays = topPicks(section.slug, total).filter((b) => b.mustRead).length;

  return (
    <main className="shell block">
      <header className="page-intro">
        <p className="kicker">
          Section · {total} books · {essays} full {essays === 1 ? "essay" : "essays"}
        </p>
        <h1>{section.label}</h1>
        <p className="lede">{section.line}</p>
      </header>
      <div className="topic-rail">
        {sections.map((item) => (
          <Link
            className={item.slug === section.slug ? "chip active" : "chip"}
            href={`/sections/${item.slug}`}
            key={item.slug}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {page === 1 ? (
        <section className="picks">
          <div className="shelf-head">
            <h2>Top picks</h2>
            <span className="kicker">Must-reads first, then the most-read cards</span>
          </div>
          <TileGrid books={topPicks(section.slug, 8)} ranked />
        </section>
      ) : null}

      <section className="shelf-section">
        <div className="shelf-head">
          <h2>{page === 1 ? "The full shelf" : `The full shelf, page ${page}`}</h2>
          <span className="kicker">{total.toLocaleString("en-US")} books in this section</span>
        </div>
        <Pagination
          current={page}
          total={pages}
          href={href}
          from={(page - 1) * PER_PAGE + 1}
          to={Math.min(page * PER_PAGE, total)}
          itemTotal={total}
        />
        <Shelf books={books} start={(page - 1) * PER_PAGE} />
        <Pagination
          current={page}
          total={pages}
          href={href}
          from={(page - 1) * PER_PAGE + 1}
          to={Math.min(page * PER_PAGE, total)}
          itemTotal={total}
        />
      </section>
    </main>
  );
}
