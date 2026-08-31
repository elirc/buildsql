// d01_annotations_inference / ex7 - reference solution (author only).

export function movingAverage(values: readonly number[], window: number): number[] {
  if (!Number.isInteger(window) || window <= 0 || window > values.length) {
    return [];
  }
  const averages: number[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i += 1) {
    sum += values[i];
    if (i >= window) {
      sum -= values[i - window];
    }
    if (i >= window - 1) {
      averages.push(sum / window);
    }
  }
  return averages;
}
