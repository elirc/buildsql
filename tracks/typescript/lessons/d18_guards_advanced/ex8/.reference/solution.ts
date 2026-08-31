// d18_guards_advanced / ex8 - reference solution (author only).

export type Guard<T> = (value: unknown) => value is T;

export type GuardType<G> = G extends (value: unknown) => value is infer T ? T : never;

export function objectOf<S extends Record<string, (value: unknown) => boolean>>(
  shape: S,
): Guard<{ [K in keyof S]: GuardType<S[K]> }> {
  return (value: unknown): value is { [K in keyof S]: GuardType<S[K]> } => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
    }
    const record = value as Record<string, unknown>;
    return Object.entries(shape).every(
      ([key, guard]) => key in record && guard(record[key]),
    );
  };
}
