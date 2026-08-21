// i1_interview_concepts / ex4 - reference solution (author only, used by `dojo verify`).
import { createRequire } from "node:module";

export interface CounterModule {
  loads: number;
}

const require = createRequire(import.meta.url);
const SPECIFIER = "./counter.cjs";

export function loadCached(): CounterModule {
  return require(SPECIFIER) as CounterModule;
}

export function loadFresh(): CounterModule {
  delete require.cache[require.resolve(SPECIFIER)];
  return require(SPECIFIER) as CounterModule;
}
