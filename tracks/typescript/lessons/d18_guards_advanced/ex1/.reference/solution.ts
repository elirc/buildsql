// d18_guards_advanced / ex1 - reference solution (author only).

export function isNonEmpty<T>(values: T[]): values is [T, ...T[]] {
  return values.length > 0;
}
