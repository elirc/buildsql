// d20_satisfies_asconst / ex6 - reference solution (author only).

export function tupleOf<const T extends readonly unknown[]>(values: T): T {
  return values;
}
