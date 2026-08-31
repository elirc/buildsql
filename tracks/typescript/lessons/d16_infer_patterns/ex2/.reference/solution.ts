// d16_infer_patterns / ex2 - reference solution (author only).

export type FirstArg<F> = F extends (first: infer A, ...rest: never[]) => unknown
  ? A
  : never;
