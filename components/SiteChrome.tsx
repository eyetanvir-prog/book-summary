import Link from "next/link";
import { LangToggle } from "@/components/Language";

export function Header() {
  return (
    <header className="shell nav">
      <Link className="brand" href="/">
        Quar<span>to</span>
      </Link>
      <nav className="nav-links" aria-label="Primary">
        <LangToggle />
        <Link href="/sections">Sections</Link>
        <Link href="/must-reads">Must-reads</Link>
        <Link href="/about">About</Link>
        <form className="search-form" action="/search" method="get">
          <input name="q" type="search" placeholder="Search 1,000+ books" aria-label="Search books" />
          <button type="submit">Go</button>
        </form>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="shell footer">
      <p>Original cards and four-minute essays. Catalog facts cached from Open Library.</p>
      <p>No account. No pile of books you will not open.</p>
    </footer>
  );
}
