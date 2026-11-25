import Link from "next/link";
import { Cover } from "@/components/Cover";
import { LTitle } from "@/components/Language";
import { sectionBySlug, type Book } from "@/lib/catalog";

export function BookTile({ book, rank, showSection = false }: { book: Book; rank?: number; showSection?: boolean }) {
  return (
    <Link className="tile" href={`/books/${book.slug}`}>
      <Cover title={book.title} slug={book.slug} coverUrl={book.thumbUrl} wash={book.wash} ink={book.ink} motif={book.motif} lazy />
      <div className="tile-copy">
        <p className="tile-kicker">
          {rank ? <span className="tile-rank">{String(rank).padStart(2, "0")}</span> : null}
          {showSection ? sectionBySlug(book.section)?.label : null}
          {book.mustRead ? <em className="badge">Essay</em> : <em className="badge quiet">Card</em>}
        </p>
        <h3>
          <LTitle slug={book.slug}>{book.title}</LTitle>
        </h3>
        <p className="tile-by">{book.author}</p>
      </div>
    </Link>
  );
}

export function TileGrid({ books, showSection = false, ranked = false }: { books: Book[]; showSection?: boolean; ranked?: boolean }) {
  return (
    <div className="tile-grid">
      {books.map((book, i) => (
        <BookTile key={book.slug} book={book} showSection={showSection} rank={ranked ? i + 1 : undefined} />
      ))}
    </div>
  );
}
