// d10_generic_constraints / ex6 - reference solution (author only).

export function groupToMap<T, G extends string | number>(
  items: readonly T[],
  groupOf: (item: T) => G,
): Map<G, T[]> {
  const groups = new Map<G, T[]>();
  for (const item of items) {
    const key = groupOf(item);
    const bucket = groups.get(key);
    if (bucket === undefined) {
      groups.set(key, [item]);
    } else {
      bucket.push(item);
    }
  }
  return groups;
}
