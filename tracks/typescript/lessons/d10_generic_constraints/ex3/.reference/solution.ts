// d10_generic_constraints / ex3 - reference solution (author only).

export function tally<K extends string>(
  keys: readonly K[],
  values: readonly string[],
): Record<K, number> {
  const counts = {} as Record<K, number>;
  for (const key of keys) {
    counts[key] = 0;
  }
  for (const value of values) {
    if (value in counts) {
      counts[value as K] += 1;
    }
  }
  return counts;
}
