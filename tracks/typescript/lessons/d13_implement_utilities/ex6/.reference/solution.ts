// d13_implement_utilities / ex6 - reference solution (author only).

export type MyAwaited<T> = T extends Promise<infer V> ? MyAwaited<V> : T;
