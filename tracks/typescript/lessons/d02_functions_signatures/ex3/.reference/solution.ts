// d02_functions_signatures / ex3 - reference solution (author only).

export function countMatching(
  values: readonly string[],
  keep: (value: string) => boolean,
): number {
  let matched = 0;
  for (const value of values) {
    if (keep(value)) {
      matched += 1;
    }
  }
  return matched;
}
