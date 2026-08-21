// 01_modules / ex2 - reference solution (author only, used by `dojo verify`).
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const legacy = require("./legacy-pricing.cjs") as {
  RATES: Record<string, number>;
  priceWithTax: (cents: number, region: string) => number;
};

export function checkout(cents: number, region: string): number {
  return legacy.priceWithTax(cents, region);
}

export function regions(): string[] {
  return Object.keys(legacy.RATES).sort();
}
