// 01_primitives_and_inference / review1 - reference solution (author only).

export function firstAndLast(values: readonly string[]): [first: string, last: string] {
  return [values[0], values[values.length - 1]];
}
