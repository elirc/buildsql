// d01_esm_cjs / ex5 - reference solution (author only, used by `dojo verify`).
import { createRequire } from "node:module";

import { add as esmAdd, total } from "./tally";

const require = createRequire(import.meta.url);

interface LegacyTally {
  total: number;
  add(n: number): void;
}

export interface TallyReadings {
  esm: [number, number];
  cjsCopy: [number, number];
  cjsProperty: [number, number];
}

export function readTwice(): TallyReadings {
  const legacy = require("./tally.cjs") as LegacyTally;

  // The destructuring is the whole point: it copies the number *now*.
  const { total: copied } = legacy;
  const esmBefore = total;
  const propertyBefore = legacy.total;

  esmAdd(5);
  legacy.add(5);

  return {
    esm: [esmBefore, total],
    cjsCopy: [copied, copied],
    cjsProperty: [propertyBefore, legacy.total],
  };
}
