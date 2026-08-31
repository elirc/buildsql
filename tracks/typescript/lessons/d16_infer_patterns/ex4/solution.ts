// d16_infer_patterns / ex4 - the far end of a tuple.
// See lessons/d16_infer_patterns/README.md, "ex4".
//
// The stub captures every element at once, which gives the union
// of the whole tuple rather than the last member of it.

export type LastOf<T> = T extends readonly (infer E)[] ? E : never;
