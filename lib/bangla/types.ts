export type BanglaSection = { heading: string; paragraphs: string[] };

export type BanglaEssay = {
  title: string;
  hook: string;
  takeaways: string[];
  sections: BanglaSection[];
};

export type BanglaBlurb = { title: string; hook: string };
