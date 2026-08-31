// d13_implement_utilities / ex7 - reference solution (author only).

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
