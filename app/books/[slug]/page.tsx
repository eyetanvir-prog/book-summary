import Link from "next/link";
import { notFound } from "next/navigation";
import { BanglaCardNote, EssayBody, HeroCopy } from "@/components/BookReading";
import { Cover } from "@/components/Cover";
import { EssayAudio } from "@/components/EssayAudio";
import { LTitle, LangToggle } from "@/components/Language";
import { getBangla } from "@/lib/bangla";
import { booksInSection, getBook, getBooks, relatedBooks, sectionBySlug, type Book } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return getBooks().map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const book = getBook((await params).slug);
  return book ? { title: `${book.title} — Quarto`, description: book.hook } : { title: "Quarto" };
}

function CatalogNote({ book }: { book: Book }) {
  return (
    <div className="catalog-note">
      <p>
        {book.description ? (
          <>
            <strong>Open Library note. </strong>
            {book.description}
          </>
        ) : (
          "Open Library did not return a catalog description for this work."
        )}
      </p>
    </div>
  );
}

function Ideas({ book, title }: { book: Book; title: string }) {
  if (!book.ideas.length) return null;
  return (
    <section className="ideas">
      <h2>{title}</h2>
      <ol className="takeaways big">
        {book.ideas.map((idea, index) => (
          <li key={idea}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{idea}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const book = getBook((await params).slug);
  if (!book) notFound();
  const section = sectionBySlug(book.section);
  const bangla = book.essay ? getBangla(book.slug) : null;
  const related = relatedBooks(book);
  const essaysNearby = booksInSection(book.section)
    .filter((b) => b.mustRead && b.slug !== book.slug)
    .slice(0, 3);

  return (
    <main className="shell">
      <article className="book-hero">
        <Cover title={book.title} slug={book.slug} coverUrl={book.coverUrl} wash={book.wash} ink={book.ink} motif={book.motif} />
        <div>
          <p className="kicker">
            <Link href={`/sections/${book.section}`}>{section?.label}</Link>
            {book.mustRead ? <span className="tag hero-tag">Must-read · full essay</span> : null}
          </p>
          <LangToggle prominent />
          {book.essay && bangla ? (
            <HeroCopy en={{ title: book.title, hook: book.hook }} bn={bangla} />
          ) : (
            <>
              <h1>{book.title}</h1>
              <p className="hook">{book.hook}</p>
            </>
          )}
          {book.essay ? <EssayAudio slug={book.slug} title={book.title} /> : null}
          <div className="facts">
            <span>
              <strong>{book.author}</strong>
            </span>
            <span>{book.year ? `First published ${book.year}` : "Year unlisted"}</span>
            {book.pages ? <span>About {book.pages} pages</span> : null}
            <span>{book.mustRead ? `${book.minutes} min read · ${book.words} words` : "Card · 1 min"}</span>
          </div>
        </div>
      </article>
      <div className="layout">
        <div className="essay">
          {book.essay ? (
            <>
              <CatalogNote book={book} />
              <EssayBody
                en={{
                  title: book.title,
                  hook: book.hook,
                  takeaways: book.essay.takeaways,
                  sections: book.essay.sections,
                }}
                bn={bangla}
              />
            </>
          ) : (
            <>
              <BanglaCardNote />
              <Ideas book={book} title="Three ideas to keep" />
              <aside className="coming" aria-label="Essay status">
                <span className="tag">Full essay · in the queue</span>
                <h2>The four-minute version isn’t written yet.</h2>
                <p>
                  Every book on Quarto gets a card. The long essays come slowly, one must-read at a time, so
                  this one is a card for now: the line above and the three ideas are the short of it.
                </p>
                {essaysNearby.length ? (
                  <div className="coming-links">
                    <small>Already up in {section?.label}</small>
                    {essaysNearby.map((other) => (
                      <Link key={other.slug} href={`/books/${other.slug}`}>
                        {other.title} <span>{other.minutes} min →</span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </aside>
              <CatalogNote book={book} />
            </>
          )}
        </div>
        <aside className="side">
          <h3>Subjects</h3>
          <div className="subjects">
            {book.subjects.length ? (
              book.subjects.map((subject) => <span key={subject}>{subject}</span>)
            ) : (
              <span>None cached</span>
            )}
          </div>
          <h3 style={{ marginTop: "1.6rem" }}>More in {section?.label}</h3>
          {related.map((other) => (
            <Link key={other.slug} href={`/books/${other.slug}`}>
              <LTitle slug={other.slug}>{other.title}</LTitle>
              {other.mustRead ? <em className="badge">Essay</em> : null}
              <br />
              <small>{other.author}</small>
            </Link>
          ))}
          <p style={{ marginTop: "1.4rem" }}>
            <a href={book.openLibraryUrl}>Work record on Open Library</a>
          </p>
        </aside>
      </div>
    </main>
  );
}
