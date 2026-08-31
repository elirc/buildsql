// d16_infer_patterns / ex8 - reference solution (author only).

export type Curried<F> = F extends (...args: infer Args) => infer R
  ? Args extends [infer First, ...infer Rest]
    ? Rest extends []
      ? (arg: First) => R
      : (arg: First) => Curried<(...args: Rest) => R>
    : () => R
  : never;
