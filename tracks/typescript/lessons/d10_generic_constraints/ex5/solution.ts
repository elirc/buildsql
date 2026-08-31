// d10_generic_constraints / ex5 - a default type parameter.
// See lessons/d10_generic_constraints/README.md, "ex5".
//
// K has a constraint and no default, so makeCache<number>() does not compile.

export interface Cache<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  has(key: K): boolean;
  size(): number;
}

export function makeCache<V, K extends string | number>(): Cache<K, V> {
  throw new Error("ex5: makeCache() is not implemented yet - edit this file.");
}
