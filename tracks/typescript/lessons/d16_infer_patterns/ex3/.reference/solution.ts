// d16_infer_patterns / ex3 - reference solution (author only).

export type TailOf<T> = T extends readonly [unknown, ...infer Rest] ? Rest : never;
