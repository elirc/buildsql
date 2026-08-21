// 03_objects_interfaces / ex3 - reference solution (author only).

export interface Tally {
  [slug: string]: number;
}

export function countAttempts(slugs: readonly string[]): Tally {
  const tally: Tally = {};
  for (const slug of slugs) {
    tally[slug] = (tally[slug] ?? 0) + 1;
  }
  return tally;
}
