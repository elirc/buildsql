// d09_generic_functions / ex4 - reference solution (author only).

export function partitionWith<T>(
  values: readonly T[],
  keep: (value: T) => boolean,
): [kept: T[], dropped: T[]] {
  const kept: T[] = [];
  const dropped: T[] = [];
  for (const value of values) {
    if (keep(value)) {
      kept.push(value);
    } else {
      dropped.push(value);
    }
  }
  return [kept, dropped];
}
