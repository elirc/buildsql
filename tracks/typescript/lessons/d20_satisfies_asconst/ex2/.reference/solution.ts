// d20_satisfies_asconst / ex2 - reference solution (author only).

export function minMax(values: readonly number[]) {
  return [Math.min(...values), Math.max(...values)] as const;
}
