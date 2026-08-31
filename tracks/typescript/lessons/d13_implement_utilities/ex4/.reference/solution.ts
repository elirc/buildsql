// d13_implement_utilities / ex4 - reference solution (author only).

export type MyParameters<F extends (...args: any[]) => unknown> = F extends (
  ...args: infer P
) => unknown
  ? P
  : never;
