// d15_conditional_types / ex1 - reference solution (author only).

export type IsArray<T> = T extends readonly unknown[] ? true : false;
