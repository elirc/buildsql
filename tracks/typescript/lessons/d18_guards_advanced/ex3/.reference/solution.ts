// d18_guards_advanced / ex3 - reference solution (author only).

export function isOneOf<T extends string>(
  allowed: readonly T[],
  value: string,
): value is T {
  return (allowed as readonly string[]).includes(value);
}
