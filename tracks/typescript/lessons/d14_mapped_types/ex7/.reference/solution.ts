// d14_mapped_types / ex7 - reference solution (author only).

export type Invert<T extends Record<string, PropertyKey>> = {
  [K in keyof T as T[K]]: K;
};
