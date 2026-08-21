// 09_mapped_conditional / ex1 - reference solution (author only).

export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

export function thaw<T extends object>(frozen: T): Mutable<T> {
  return { ...frozen };
}
