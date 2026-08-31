// d16_infer_patterns / ex5 - reference solution (author only).

export type Flatten<T> = T extends readonly (infer E)[] ? Flatten<E> : T;
