import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell">
      <div className="empty">
        <h2>That page is not on the shelf.</h2>
        <p>
          <Link href="/">Return to the index</Link>
        </p>
      </div>
    </main>
  );
}
