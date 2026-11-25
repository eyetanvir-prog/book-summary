import Link from "next/link";
import { sectionBySlug, type Book } from "@/lib/catalog";

export function Shelf({
  books,
  start = 0,
  showSection = false,
}: {
  books: Book[];
  start?: number;
  showSection?: boolean;
}) {
  return (
    <div className="shelf">
      {books.map((book, index) => (
        <Link className="row" href={`/books/${book.slug}`} key={book.slug}>
          <span className="idx">{String(start + index + 1).padStart(2, "0")}</span>
          <div>
            <h3>
              {book.title}
              {book.mustRead ? <em className="badge">Essay</em> : null}
            </h3>
            <p className="by">{book.author}</p>
            <p>{book.hook}</p>
          </div>
          <span className="meta-bit">{book.author}</span>
          <span className="meta-bit">
            {showSection ? `${sectionBySlug(book.section)?.label} · ` : ""}
            {book.mustRead ? `${book.minutes} min` : "Card"}
          </span>
          <span className="arrow" aria-hidden>
            →
          </span>
        </Link>
      ))}
    </div>
  );
}
