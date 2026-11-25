"use client";

import { useLanguage } from "@/components/Language";
import type { BanglaEssay } from "@/lib/bangla/types";

type Copy = {
  title: string;
  hook: string;
  takeaways: string[];
  sections: { heading: string; paragraphs: string[] }[];
};

export function HeroCopy({ en, bn }: { en: Pick<Copy, "title" | "hook">; bn: BanglaEssay | null }) {
  const { lang } = useLanguage();
  const show = lang === "bn" && bn;
  const title = show ? bn.title : en.title;
  const hook = show ? bn.hook : en.hook;
  return (
    <>
      <h1 className={show ? "bn-copy" : undefined}>{title}</h1>
      <p className={show ? "hook bn-copy" : "hook"}>{hook}</p>
    </>
  );
}

export function EssayBody({ en, bn }: { en: Copy; bn: BanglaEssay | null }) {
  const { lang } = useLanguage();
  const copy = lang === "bn" && bn ? bn : en;
  const show = copy === bn && bn !== null;
  return (
    <div className={show ? "bn-copy" : undefined}>
      {copy.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </section>
      ))}
      <h2>{show ? "এগুলো মনে রাখবেন" : "Keep these"}</h2>
      <ol className="takeaways">
        {copy.takeaways.map((item, index) => (
          <li key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{item}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function BanglaCardNote() {
  const { lang } = useLanguage();
  if (lang !== "bn") return null;
  return (
    <p className="bn-note bn-copy">
      বাংলা আছে পূর্ণ প্রবন্ধে। এই বইটি এখনও কার্ড, তাই শিরোনাম, লাইন আর তিনটি ভাব ইংরেজিতেই আছে।
    </p>
  );
}
