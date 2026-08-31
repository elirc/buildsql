// d01_annotations_inference / ex4 - reference solution (author only).

export function topReadings(values: readonly number[], count: number): readonly number[] {
  if (count <= 0) {
    return [];
  }
  return [...values].sort((a, b) => b - a).slice(0, count);
}
