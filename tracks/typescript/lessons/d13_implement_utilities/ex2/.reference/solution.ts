// d13_implement_utilities / ex2 - reference solution (author only).

export type MyRequired<T> = { [K in keyof T]-?: T[K] };
