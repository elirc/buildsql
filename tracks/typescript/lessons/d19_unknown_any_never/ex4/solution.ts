// d19_unknown_any_never / ex4 - an untyped store with a typed door.
// See lessons/d19_unknown_any_never/README.md, "ex4".
//
// The stub stores nothing and its get() returns unknown, so the
// caller is no better off than with a bare Map.

export interface Cache {
  set(key: string, value: unknown): void;
  get<T>(key: string, guard: (value: unknown) => value is T): unknown;
  has(key: string): boolean;
}

export function createCache(): Cache {
  throw new Error("ex4: createCache() is not implemented yet - edit this file.");
}
