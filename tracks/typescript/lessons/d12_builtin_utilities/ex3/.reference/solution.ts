// d12_builtin_utilities / ex3 - reference solution (author only).

export function firstDefined<T>(
  values: readonly (T | null | undefined)[],
): NonNullable<T> | undefined {
  for (const value of values) {
    if (value !== null && value !== undefined) {
      return value as NonNullable<T>;
    }
  }
  return undefined;
}
