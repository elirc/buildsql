// d15_conditional_types / ex6 - reference solution (author only).

export type IsNever<T> = [T] extends [never] ? true : false;
