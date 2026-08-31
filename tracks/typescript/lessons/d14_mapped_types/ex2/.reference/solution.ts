// d14_mapped_types / ex2 - reference solution (author only).

export type Locked<T> = { readonly [K in keyof T]-?: T[K] };
