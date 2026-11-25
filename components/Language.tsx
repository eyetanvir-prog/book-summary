"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import blurbs from "@/lib/bangla/blurbs.json";
import type { BanglaBlurb } from "@/lib/bangla/types";

const STORAGE_KEY = "quarto-lang";

export type Lang = "en" | "bn";

const table = blurbs as Record<string, BanglaBlurb>;

type LanguageValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageValue | null>(null);

function applyLang(lang: Lang) {
  document.documentElement.lang = lang === "bn" ? "bn" : "en";
  document.documentElement.classList.toggle("lang-bn", lang === "bn");
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "bn") {
      setLangState("bn");
      applyLang("bn");
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyLang(next);
  };

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}

export function blurbFor(slug: string) {
  return table[slug] ?? null;
}

export function LangToggle({ prominent = false }: { prominent?: boolean }) {
  const { lang, setLang } = useLanguage();
  const hint = lang === "bn" ? "বাংলা আছে প্রবন্ধে" : "Bangla is on the essays";
  return (
    <div className={prominent ? "lang-block prominent" : "lang-block"}>
      <div className="lang-switch" role="group" aria-label={lang === "bn" ? "ভাষা। বাংলা আছে প্রবন্ধে।" : "Language. Bangla is on the essays."}>
        <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
          English
        </button>
        <button type="button" aria-pressed={lang === "bn"} onClick={() => setLang("bn")}>
          বাংলা
        </button>
      </div>
      <p className="lang-hint">{hint}</p>
    </div>
  );
}

export function LTitle({ slug, children }: { slug: string; children: string }) {
  const { lang } = useLanguage();
  const blurb = lang === "bn" ? table[slug] : null;
  if (!blurb) return <>{children}</>;
  return <span className="bn-title">{blurb.title}</span>;
}

export function LHook({ slug, children }: { slug: string; children: string }) {
  const { lang } = useLanguage();
  const blurb = lang === "bn" ? table[slug] : null;
  if (!blurb) return <>{children}</>;
  return <span className="bn-copy">{blurb.hook}</span>;
}
