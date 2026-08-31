// d09_generic_functions / ex5 - reference solution (author only).

export function rotate<T>(values: readonly T[], by: number): T[] {
  if (values.length === 0) {
    return [];
  }
  const offset = ((by % values.length) + values.length) % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
}
