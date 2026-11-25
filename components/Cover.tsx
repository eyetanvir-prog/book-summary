"use client";

import { useState } from "react";

export function Cover({
  title,
  coverUrl,
  wash,
  ink,
  motif,
  lazy = false,
}: {
  title: string;
  coverUrl: string | null;
  wash: string;
  ink: string;
  motif: string;
  lazy?: boolean;
}) {
  const [failed, setFailed] = useState(!coverUrl);

  return (
    <div className={failed ? "cover miss" : "cover"} style={{ background: wash, color: ink }}>
      {coverUrl && !failed ? (
        // Open Library cover. If it fails, the designed plate stays.
        <img src={coverUrl} alt="" loading={lazy ? "lazy" : undefined} onError={() => setFailed(true)} />
      ) : null}
      <div className="cover-art" style={{ opacity: failed ? 1 : 0 }}>
        <i className={`motif ${motif}`} aria-hidden />
        <strong>{title}</strong>
      </div>
    </div>
  );
}
