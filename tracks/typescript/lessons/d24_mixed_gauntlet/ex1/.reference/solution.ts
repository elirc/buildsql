// d24_mixed_gauntlet / ex1 - reference solution (author only).

export function firstMatching<T, S extends T>(
  values: readonly T[],
  guard: (value: T) => value is S,
): S | undefined {
  for (const value of values) {
    if (guard(value)) {
      return value;
    }
  }
  return undefined;
}
