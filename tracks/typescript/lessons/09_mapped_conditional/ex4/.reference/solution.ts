// 09_mapped_conditional / ex4 - reference solution (author only).

export type MyExclude<T, U> = T extends U ? never : T;

export type BoxEach<T> = T extends unknown ? T[] : never;

export type BoxAll<T> = [T] extends [unknown] ? T[] : never;

export function withoutValues<T extends string, U extends T>(
  values: readonly T[],
  remove: readonly U[],
): MyExclude<T, U>[] {
  const removed = new Set<string>(remove);
  return values.filter((value) => !removed.has(value)) as MyExclude<T, U>[];
}
