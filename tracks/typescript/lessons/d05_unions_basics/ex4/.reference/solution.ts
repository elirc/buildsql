// d05_unions_basics / ex4 - reference solution (author only).

export function splitCells(values: readonly (string | number)[]): {
  texts: string[];
  numbers: number[];
} {
  const texts: string[] = [];
  const numbers: number[] = [];
  for (const value of values) {
    if (typeof value === "string") {
      texts.push(value);
    } else {
      numbers.push(value);
    }
  }
  return { texts, numbers };
}
