// d19_unknown_any_never / ex5 - reference solution (author only).

export type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};
