// i3_interview_rapidfire / ex4 - reference solution (author only).

export type MyNonNullable<T> = T extends null | undefined ? never : T;

export type MyReturnType<F> = F extends (...args: never[]) => infer R ? R : never;

export function compact<T>(items: readonly T[]): MyNonNullable<T>[] {
  return items.filter(
    (item): item is MyNonNullable<T> => item !== null && item !== undefined,
  );
}
