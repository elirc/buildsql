// d09_generic_functions / ex7 - reference solution (author only).

export function mergeSorted<T>(
  a: readonly T[],
  b: readonly T[],
  compare: (x: T, y: T) => number,
): T[] {
  const merged: T[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (compare(a[i], b[j]) <= 0) {
      merged.push(a[i]);
      i += 1;
    } else {
      merged.push(b[j]);
      j += 1;
    }
  }
  while (i < a.length) {
    merged.push(a[i]);
    i += 1;
  }
  while (j < b.length) {
    merged.push(b[j]);
    j += 1;
  }
  return merged;
}
