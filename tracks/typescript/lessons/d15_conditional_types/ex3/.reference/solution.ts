// d15_conditional_types / ex3 - reference solution (author only).

export type ToArrayAll<T> = [T] extends [unknown] ? T[] : never;
