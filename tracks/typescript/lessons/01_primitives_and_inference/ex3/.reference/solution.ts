// 01_primitives_and_inference / ex3 - reference solution (author only).

export function sortedCopy(values: readonly number[]): number[] {
  return [...values].sort((a, b) => a - b);
}
