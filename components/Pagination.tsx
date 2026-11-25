import Link from "next/link";

function pageList(current: number, total: number) {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

export function Pagination({
  current,
  total,
  href,
  from,
  to,
  itemTotal,
}: {
  current: number;
  total: number;
  href: (page: number) => string;
  from?: number;
  to?: number;
  itemTotal?: number;
}) {
  if (total <= 1 && itemTotal === undefined) return null;
  const pages = pageList(current, total);
  const range =
    from !== undefined && to !== undefined && itemTotal !== undefined ? (
      <p className="pager-range" aria-live="polite">
        <strong>
          {from.toLocaleString("en-US")}–{to.toLocaleString("en-US")}
        </strong>{" "}
        of {itemTotal.toLocaleString("en-US")}
      </p>
    ) : null;

  return (
    <nav className="pager-bar" aria-label="Pages">
      {current > 1 ? (
        <Link className="pager-step" href={href(current - 1)} rel="prev">
          ← Previous
        </Link>
      ) : (
        <span className="pager-step off">← Previous</span>
      )}
      <div className="pager-mid">
        {range}
        {total > 1 ? (
          <ol className="pager">
            {pages.map((page, i) => (
              <li key={page}>
                {i > 0 && page - pages[i - 1] > 1 ? <span className="pager-gap">…</span> : null}
                {page === current ? (
                  <span className="pager-num on" aria-current="page">
                    {page}
                  </span>
                ) : (
                  <Link className="pager-num" href={href(page)}>
                    {page}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        ) : null}
      </div>
      {current < total ? (
        <Link className="pager-step" href={href(current + 1)} rel="next">
          Next →
        </Link>
      ) : (
        <span className="pager-step off">Next →</span>
      )}
    </nav>
  );
}