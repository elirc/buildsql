// d14_mapped_types / ex4 - reference solution (author only).

export type Watchers<T> = {
  [K in keyof T & string as `${K}Changed`]: (value: T[K]) => void;
};
