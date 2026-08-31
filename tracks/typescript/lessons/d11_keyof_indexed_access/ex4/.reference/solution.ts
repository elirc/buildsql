// d11_keyof_indexed_access / ex4 - reference solution (author only).

export function sample<T extends readonly unknown[]>(
  values: T,
  index: number,
): T[number] | undefined {
  if (!Number.isInteger(index)) {
    return undefined;
  }
  const at = index < 0 ? values.length + index : index;
  if (at < 0 || at >= values.length) {
    return undefined;
  }
  return values[at];
}
