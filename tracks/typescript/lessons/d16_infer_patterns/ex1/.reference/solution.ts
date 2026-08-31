// d16_infer_patterns / ex1 - reference solution (author only).

export type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
