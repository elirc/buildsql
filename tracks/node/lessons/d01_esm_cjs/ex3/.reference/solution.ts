// d01_esm_cjs / ex3 - reference solution (author only, used by `dojo verify`).
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const legacy = require("./legacy-rules.cjs") as {
  VERSION: string;
  RULES: Record<string, (n: number) => number>;
  apply: (name: string, value: number) => number;
};

export function legacyVersion(): string {
  return legacy.VERSION;
}

export function ruleNames(): string[] {
  return Object.keys(legacy.RULES).sort();
}

export function applyRule(name: string, value: number): number {
  return legacy.apply(name, value);
}
