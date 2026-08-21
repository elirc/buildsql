// i3_interview_rapidfire / ex4 - 90 seconds: write the utility type.
// See lessons/i3_interview_rapidfire/README.md, "Round 4".
//
// Both aliases are placeholders, and compact() should use the first one.

export type MyNonNullable<T> = T;

export type MyReturnType<F> = F;

export function compact<T>(items: readonly T[]): MyNonNullable<T>[] {
  throw new Error("ex4: compact() is not implemented yet - edit this file.");
}
