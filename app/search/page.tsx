import { Suspense } from "react";
import { SearchView } from "@/components/SearchView";

export const metadata = { title: "Search — Quarto" };

export default function SearchPage() {
  return (
    <main className="shell block">
      <Suspense fallback={<p className="kicker">Loading search…</p>}>
        <SearchView />
      </Suspense>
    </main>
  );
}