// d01_esm_cjs / ex4 - the require cache, and how to evict from it.
// See lessons/d01_esm_cjs/README.md, "Problem 4".

export interface Registry {
  entries: string[];
  add(name: string): number;
}

/** The cached instance of ./registry.cjs - the same object every time. */
export function sharedRegistry(): Registry {
  throw new Error("ex4: sharedRegistry() is not implemented yet - edit this file.");
}

/** Evict ./registry.cjs from the cache and load it again, from scratch. */
export function freshRegistry(): Registry {
  throw new Error("ex4: freshRegistry() is not implemented yet - edit this file.");
}
