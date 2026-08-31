// d09_generic_functions / ex3 - reference solution (author only).

export function zipWith<A, B, C>(
  a: readonly A[],
  b: readonly B[],
  combine: (a: A, b: B) => C,
): C[] {
  const combined: C[] = [];
  const shortest = Math.min(a.length, b.length);
  for (let i = 0; i < shortest; i += 1) {
    combined.push(combine(a[i], b[i]));
  }
  return combined;
}
