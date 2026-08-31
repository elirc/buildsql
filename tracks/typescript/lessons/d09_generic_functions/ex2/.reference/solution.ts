// d09_generic_functions / ex2 - reference solution (author only).

export function interleave<T>(a: readonly T[], b: readonly T[]): T[] {
  const woven: T[] = [];
  const longest = Math.max(a.length, b.length);
  for (let i = 0; i < longest; i += 1) {
    if (i < a.length) {
      woven.push(a[i]);
    }
    if (i < b.length) {
      woven.push(b[i]);
    }
  }
  return woven;
}
