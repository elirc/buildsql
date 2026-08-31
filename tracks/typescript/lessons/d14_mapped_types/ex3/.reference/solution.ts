// d14_mapped_types / ex3 - reference solution (author only).

export type Boxed<T> = { [K in keyof T]: { value: T[K] } };
