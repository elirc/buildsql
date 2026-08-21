// 06_generics_1 / ex3 - reference solution (author only).

export interface Box<T> {
  readonly value: T;
  map<U>(transform: (value: T) => U): Box<U>;
}

export function box<T>(value: T): Box<T> {
  return {
    value,
    map<U>(transform: (value: T) => U): Box<U> {
      return box(transform(value));
    },
  };
}
