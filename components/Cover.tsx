"use client";

import { useState } from "react";
import { blurbFor, useLanguage } from "@/components/Language";

export function Cover({
  title,
  slug,
  coverUrl,
  wash,
  ink,
  motif,
  lazy = false,
}: {
  title: string;
  slug?: string;
  coverUrl: string | null;
  wash: string;
  ink: string;
  motif: string;
  lazy?: boolean;
}) {
  const { lang } = useLanguage();
  const [failed, setFailed] = useState(!coverUrl);
  const bangla = lang === "bn" && slug ? blurbFor(slug) : null;
  const plate = bangla?.title ?? title;

  return (
    <div className={failed ? "cover miss" : "cover"} style={{ background: wash, color: ink }}>
      {coverUrl && !failed ? (
        // Open Library cover. If it fails, the designed plate stays.
        <img src={coverUrl} alt="" loading={lazy ? "lazy" : undefined} onError={() => setFailed(true)} />
      ) : null}
      <div className="cover-art" style={{ opacity: failed ? 1 : 0 }}>
        <i className={`motif ${motif}`} aria-hidden />
        <strong className={bangla ? "bn-title" : undefined}>{plate}</strong>
      </div>
    </div>
  );
}
