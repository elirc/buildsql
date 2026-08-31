// d02_module_patterns / ex5 - the dependency seam.
// See lessons/d02_module_patterns/README.md, "Problem 5".

export interface Entry {
  id: string;
  event: string;
  at: number;
}

export interface Store {
  save(entry: Entry): void;
  all(): Entry[];
}

export interface Deps {
  /** epoch milliseconds */
  now: () => number;
  /** the next id; the default counts e-1, e-2, ... */
  ids: () => string;
  store: Store;
}

export interface Service {
  record(event: string): Entry;
  history(): Entry[];
}

/**
 * Build a service over its dependencies. Anything not overridden comes from a
 * FRESH set of defaults, so two services never share a store.
 */
export function createService(overrides: Partial<Deps> = {}): Service {
  throw new Error("ex5: createService() is not implemented yet - edit this file.");
}
