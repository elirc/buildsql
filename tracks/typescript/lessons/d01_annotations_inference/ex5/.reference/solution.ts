// d01_annotations_inference / ex5 - reference solution (author only).

export function summarise(
  values: readonly number[],
): { count: number; mean: number; spread: number } {
  if (values.length === 0) {
    return { count: 0, mean: 0, spread: 0 };
  }
  let min = values[0];
  let max = values[0];
  let sum = 0;
  for (const value of values) {
    if (value < min) {
      min = value;
    }
    if (value > max) {
      max = value;
    }
    sum += value;
  }
  return { count: values.length, mean: sum / values.length, spread: max - min };
}
