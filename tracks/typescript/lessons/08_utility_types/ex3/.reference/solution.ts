// 08_utility_types / ex3 - reference solution (author only).

export type MyPartial<T> = { [K in keyof T]?: T[K] };

export type MyPick<T, K extends keyof T> = { [P in K]: T[P] };

export function pickKeys<T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[],
): MyPick<T, K> {
  const picked = {} as MyPick<T, K>;
  for (const key of keys) {
    picked[key] = source[key];
  }
  return picked;
}
