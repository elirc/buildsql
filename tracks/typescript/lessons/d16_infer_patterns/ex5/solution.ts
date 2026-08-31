// d16_infer_patterns / ex5 - unwrap all the way down.
// See lessons/d16_infer_patterns/README.md, "ex5".
//
// The stub unwraps exactly one layer and stops, which is right
// for string[] and wrong for everything deeper.

export type Flatten<T> = T extends readonly (infer E)[] ? E : T;
