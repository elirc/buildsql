// d21_async_typing / ex8 - reference solution (author only).

export function allOf<const T extends readonly unknown[]>(
  values: T,
): Promise<{ -readonly [K in keyof T]: Awaited<T[K]> }> {
  return Promise.all(values) as Promise<{ -readonly [K in keyof T]: Awaited<T[K]> }>;
}
