// d14_mapped_types / ex5 - reference solution (author only).

export type PickByType<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};
