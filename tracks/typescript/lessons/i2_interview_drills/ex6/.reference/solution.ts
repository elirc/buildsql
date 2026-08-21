// i2_interview_drills / ex6 - reference solution (author only).

export function pipe<A, B>(value: A, ab: (input: A) => B): B;
export function pipe<A, B, C>(value: A, ab: (input: A) => B, bc: (input: B) => C): C;
export function pipe<A, B, C, D>(
  value: A,
  ab: (input: A) => B,
  bc: (input: B) => C,
  cd: (input: C) => D,
): D;
export function pipe(value: unknown, ...fns: ((input: unknown) => unknown)[]): unknown {
  return fns.reduce((current, fn) => fn(current), value);
}
