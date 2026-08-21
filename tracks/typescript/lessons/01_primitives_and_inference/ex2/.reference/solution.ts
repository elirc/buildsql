// 01_primitives_and_inference / ex2 - reference solution (author only).

export function minMax(values: number[]): [min: number, max: number] {
  let min = values[0];
  let max = values[0];
  for (const value of values) {
    if (value < min) {
      min = value;
    }
    if (value > max) {
      max = value;
    }
  }
  return [min, max];
}
