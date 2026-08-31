// d01_esm_cjs / ex4 - reference solution (author only, used by `dojo verify`).
import { createRequire } from "node:module";

export interface Registry {
  entries: string[];
  add(name: string): number;
}

const require = createRequire(import.meta.url);
const SPECIFIER = "./registry.cjs";

export function sharedRegistry(): Registry {
  return require(SPECIFIER) as Registry;
}

export function freshRegistry(): Registry {
  delete require.cache[require.resolve(SPECIFIER)];
  return require(SPECIFIER) as Registry;
}
