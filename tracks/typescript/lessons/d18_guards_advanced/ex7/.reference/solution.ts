// d18_guards_advanced / ex7 - reference solution (author only).

export function everyIs<T, S extends T>(
  guard: (value: T) => value is S,
): (values: readonly T[]) => values is readonly S[] {
  return (values: readonly T[]): values is readonly S[] =>
    values.every((value) => guard(value));
}
