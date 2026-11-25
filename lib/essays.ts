import { essaysA } from "./essays/a";
import { essaysB } from "./essays/b";
import { essaysC } from "./essays/c";
import { essaysD } from "./essays/d";
import { essaysE } from "./essays/e";
import { essaysF } from "./essays/f";
import { essaysG } from "./essays/g";
import { essaysH } from "./essays/h";
import type { Essay } from "./essay-type";

export type { Essay };

export const essays: Essay[] = [
  ...essaysA,
  ...essaysB,
  ...essaysC,
  ...essaysD,
  ...essaysE,
  ...essaysF,
  ...essaysG,
  ...essaysH,
];
