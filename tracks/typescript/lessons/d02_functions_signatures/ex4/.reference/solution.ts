// d02_functions_signatures / ex4 - reference solution (author only).

export type Formatter = (value: number) => string;

export function formatAll(
  values: readonly number[],
  format: Formatter = (value) => value.toFixed(2),
): string[] {
  return values.map((value) => format(value));
}
