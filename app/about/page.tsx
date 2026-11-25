import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "About — Quarto" };

export default function AboutPage() {
  return (
    <main className="shell">
      <header className="page-intro">
        <p className="kicker">About</p>
        <h1>Written here. Not collected elsewhere.</h1>
      </header>
      <div className="about">
        <p>
          Quarto is a catalog of 1,054 books. Every one has a short card of our own: a hook and
          three ideas worth keeping. Forty-seven of them also have a full essay, meant to take
          about four minutes: a way into the book, a few claims you can use, and the places the
          usual summary gets lazy. More essays are in the queue. The wording is ours. It is not a
          condensation scraped from another summary site, and it is not a substitute for the book.
        </p>
        <p>
          Authors, catalog years, subject headings, short catalog descriptions, and cover images
          are cached from Open Library in <code>lib/open-library.json</code>. Those fields are
          theirs, including the oddities — a year that marks an edition they hold, a subject list
          that sounds like a card catalog. If a cover fails to load, the page keeps a designed
          plate instead. Nothing is stored in a database.
        </p>
        <p>
          The sections on this site are a smaller map we made so the shelf can be browsed.
          They sit beside the Open Library subjects, not instead of them.
        </p>
        <figure className="maker">
          <div className="maker-frame">
            <Image
              src="/tanvir-ahmed.jpg"
              alt="Tanvir Ahmed on a balcony, forested hills behind him"
              fill
              sizes="260px"
              className="maker-img"
            />
          </div>
          <figcaption className="maker-copy">
            <p className="kicker">Built by</p>
            <p className="maker-name">Tanvir Ahmed</p>
            <p>The shelf, and the four-minute essays on it.</p>
          </figcaption>
        </figure>
        <p>
          <Link href="/">Back to the shelf</Link>
        </p>
      </div>
    </main>
  );
}
