// d24_mixed_gauntlet / ex3 - reference solution (author only).

export type Stringified<T> = { [K in keyof T]: T[K] extends number ? string : T[K] };

export function stringifyNumbers<T extends Record<string, unknown>>(value: T): Stringified<T> {
  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    result[key] = typeof entry === "number" ? String(entry) : entry;
  }
  return result as Stringified<T>;
}
