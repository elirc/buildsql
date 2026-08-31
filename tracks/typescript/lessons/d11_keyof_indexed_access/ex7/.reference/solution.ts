// d11_keyof_indexed_access / ex7 - reference solution (author only).

export function project<T extends object, K extends keyof T>(
  rows: readonly T[],
  keys: readonly K[],
): Pick<T, K>[] {
  return rows.map((row) => {
    const projected = {} as Pick<T, K>;
    for (const key of keys) {
      projected[key] = row[key];
    }
    return projected;
  });
}
