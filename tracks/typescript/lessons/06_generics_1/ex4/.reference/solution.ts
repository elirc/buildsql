// 06_generics_1 / ex4 - reference solution (author only).

export function zipPairs<A, B>(a: readonly A[], b: readonly B[]): [A, B][] {
  const pairs: [A, B][] = [];
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i++) {
    pairs.push([a[i], b[i]]);
  }
  return pairs;
}
