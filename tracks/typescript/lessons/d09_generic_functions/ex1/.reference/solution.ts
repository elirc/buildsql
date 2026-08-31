// d09_generic_functions / ex1 - reference solution (author only).

export function takeWhile<T>(values: readonly T[], keep: (value: T) => boolean): T[] {
  const taken: T[] = [];
  for (const value of values) {
    if (!keep(value)) {
      return taken;
    }
    taken.push(value);
  }
  return taken;
}
