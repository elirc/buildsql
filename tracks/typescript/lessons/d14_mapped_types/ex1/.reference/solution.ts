// d14_mapped_types / ex1 - reference solution (author only).

export type Nullable<T> = { [K in keyof T]: T[K] | null };
