import b01 from "./batch-01.json";
import b02 from "./batch-02.json";
import b03 from "./batch-03.json";
import b04 from "./batch-04.json";
import b05 from "./batch-05.json";
import b06 from "./batch-06.json";
import b07 from "./batch-07.json";
import b08 from "./batch-08.json";
import b09 from "./batch-09.json";
import b10 from "./batch-10.json";
import b11 from "./batch-11.json";

export type Card = { hook: string; ideas: string[] };

// Original cards written for Quarto, one file per batch from `npm run catalog -- --batches`.
export const cards: Record<string, Card> = Object.assign(
  {},
  b01,
  b02,
  b03,
  b04,
  b05,
  b06,
  b07,
  b08,
  b09,
  b10,
  b11,
);
