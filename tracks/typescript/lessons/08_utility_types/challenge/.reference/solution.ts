// 08_utility_types / challenge - reference solution (author only).

export type MyOmit<T, K extends keyof T> = { [P in Exclude<keyof T, K>]: T[P] };

export function omitKeys<T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[],
): MyOmit<T, K> {
  const copy: Record<string, unknown> = { ...source };
  for (const key of keys) {
    delete copy[key as string];
  }
  return copy as MyOmit<T, K>;
}
