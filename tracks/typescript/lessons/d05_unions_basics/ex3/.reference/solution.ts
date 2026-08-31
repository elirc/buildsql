// d05_unions_basics / ex3 - reference solution (author only).

export function sumNumeric(values: readonly (string | number)[]): number {
  let total = 0;
  for (const value of values) {
    if (typeof value === "number") {
      total += value;
    }
  }
  return total;
}
