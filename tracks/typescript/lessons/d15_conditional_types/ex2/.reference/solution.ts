// d15_conditional_types / ex2 - reference solution (author only).

export type ToArray<T> = T extends unknown ? T[] : never;
