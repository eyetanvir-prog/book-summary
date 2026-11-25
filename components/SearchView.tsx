"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Pagination } from "@/components/Pagination";
import { Shelf } from "@/components/Shelf";
import { getBooks, PER_PAGE, searchBooks, sectionBySlug, sections } from "@/lib/catalog";

export function SearchView() {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim().slice(0, 120);
  const sectionSlug = params.get("section") ?? "";
  const section = sectionBySlug(sectionSlug);
  const pageParam = Number.parseInt(params.get("page") ?? "1", 10) || 1;

  const results = useMemo(
    () => (query || section ? searchBooks(query, section?.slug) : []),
    [query, section],
  );
  const pages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, pageParam));
  const shown = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const catalogTotal = getBooks().length;

  const href = (opts: { section?: string | null; page?: number }) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    const s = opts.section === undefined ? section?.slug : opts.section;
    if (s) next.set("section", s);
    if (opts.page && opts.page > 1) next.set("page", String(opts.page));
    const qs = next.toString();
    return qs ? `/search?${qs}` : "/search";
  };

  return (
    <>
      <header className="page-intro">
        <p className="kicker">Search · {catalogTotal.toLocaleString("en-US")} books</p>
        <h1>{query ? `“${query}”` : section ? section.label : "Find a thread."}</h1>
        <form className="search-form page-search" action="/search" method="get">
          <input
            name="q"
            defaultValue={query}
            type="search"
            aria-label="Search books"
            placeholder="Title, author, subject, an idea"
          />
          {section ? <input type="hidden" name="section" value={section.slug} /> : null}
          <button type="submit">Go</button>
        </form>
      </header>
      <div className="topic-rail">
        <Link className={section ? "chip" : "chip active"} href={href({ section: null })}>
          All sections
        </Link>
        {sections.map((item) => (
          <Link
            className={item.slug === section?.slug ? "chip active" : "chip"}
            href={href({ section: item.slug })}
            key={item.slug}
          >
            {item.label}
            <span className="chip-count">{item.count}</span>
          </Link>
        ))}
      </div>
      {!query && !section ? (
        <div className="empty">
          <h2>Search the whole catalog.</h2>
          <p>
            Try an author (Christie, Ghazali, Kahneman), a subject (Stoicism, Mount Everest, habits), or a
            word from an idea. Pick a section to narrow it.
          </p>
        </div>
      ) : results.length ? (
        <>
          <div className="shelf-head">
            <h2>
              {results.length} {results.length === 1 ? "book" : "books"}
            </h2>
            <span className="kicker">Best matches first</span>
          </div>
          <Pagination
            current={page}
            total={pages}
            href={(n) => href({ page: n })}
            from={(page - 1) * PER_PAGE + 1}
            to={Math.min(page * PER_PAGE, results.length)}
            itemTotal={results.length}
          />
          <Shelf books={shown} start={(page - 1) * PER_PAGE} showSection />
          <Pagination
            current={page}
            total={pages}
            href={(n) => href({ page: n })}
            from={(page - 1) * PER_PAGE + 1}
            to={Math.min(page * PER_PAGE, results.length)}
            itemTotal={results.length}
          />
        </>
      ) : (
        <div className="empty">
          <h2>Nothing in the catalog matches that.</h2>
          <p>
            Try a plainer word — war, faith, money, home — or{" "}
            {section ? <Link href={href({ section: null })}>search every section</Link> : "start from a section"}.
          </p>
        </div>
      )}
    </>
  );
}