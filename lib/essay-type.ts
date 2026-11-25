export type Essay = {
  slug: string;
  title: string;
  authorCredit: string;
  hook: string;
  motif: "rings" | "bars" | "grid" | "arc";
  wash: string;
  ink: string;
  takeaways: string[];
  sections: { heading: string; paragraphs: string[] }[];
};
