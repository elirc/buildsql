// d23_realworld_apis / ex5 - a cache that can tell the time.
// See lessons/d23_realworld_apis/README.md, "ex5".
//
// The stub throws when the cache is created, and its get()
// promises unknown.

export interface TtlCache<T> {
  set(key: string, value: T): void;
  get(key: string): unknown;
  size(): number;
}

export function createTtlCache<T>(ttlMs: number, now: () => number): TtlCache<T> {
  throw new Error("ex5: createTtlCache() is not implemented yet - edit this file.");
}
