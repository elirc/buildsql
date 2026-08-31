// d13_implement_utilities / ex1 - reference solution (author only).

export type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
