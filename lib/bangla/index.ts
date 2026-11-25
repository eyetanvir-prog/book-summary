import type { BanglaEssay } from "./types";
import a from "./a.json";
import b from "./b.json";
import c from "./c.json";
import d from "./d.json";
import e from "./e.json";
import f from "./f.json";
import g from "./g.json";
import h from "./h.json";

const all: Record<string, BanglaEssay> = {
  ...(a as Record<string, BanglaEssay>),
  ...(b as Record<string, BanglaEssay>),
  ...(c as Record<string, BanglaEssay>),
  ...(d as Record<string, BanglaEssay>),
  ...(e as Record<string, BanglaEssay>),
  ...(f as Record<string, BanglaEssay>),
  ...(g as Record<string, BanglaEssay>),
  ...(h as Record<string, BanglaEssay>),
};

export function getBangla(slug: string): BanglaEssay | null {
  return all[slug] ?? null;
}

export function banglaSlugs() {
  return Object.keys(all);
}
