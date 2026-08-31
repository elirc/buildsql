// d10_generic_constraints / ex4 - reference solution (author only).

export function withDefaults<T extends object, D extends object>(value: T, defaults: D): T & D {
  return { ...defaults, ...value } as T & D;
}
