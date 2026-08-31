// d10_generic_constraints / ex5 - reference solution (author only).

export interface Cache<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  has(key: K): boolean;
  size(): number;
}

export function makeCache<V, K extends string | number = string>(): Cache<K, V> {
  const entries = new Map<K, V>();
  return {
    get(key: K): V | undefined {
      return entries.get(key);
    },
    set(key: K, value: V): void {
      entries.set(key, value);
    },
    has(key: K): boolean {
      return entries.has(key);
    },
    size(): number {
      return entries.size;
    },
  };
}
