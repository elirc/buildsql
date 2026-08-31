// d15_conditional_types / ex7 - reference solution (author only).

export type IsAny<T> = 0 extends 1 & T ? true : false;
