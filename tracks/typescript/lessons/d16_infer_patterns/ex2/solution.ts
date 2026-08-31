// d16_infer_patterns / ex2 - the first parameter.
// See lessons/d16_infer_patterns/README.md, "ex2".
//
// The stub captures the whole parameter list, which is a
// different utility with a different name.

export type FirstArg<F> = F extends (...args: infer A) => unknown ? A : never;
