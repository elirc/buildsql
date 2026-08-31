// d15_conditional_types / ex5 - widen a literal.
// See lessons/d15_conditional_types/README.md, "ex5".
//
// The stub is the identity type: it hands T straight back, which
// is right for objects and wrong for every literal.

export type Widen<T> = T;
