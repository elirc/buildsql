// d15_conditional_types / ex8 - are these two types identical.
// See lessons/d15_conditional_types/README.md, "ex8".
//
// The stub is the mutual-assignability test. It is right about
// ordinary types and wrong about any - and wrong is what any is for.

export type Equals<X, Y> = X extends Y ? (Y extends X ? true : false) : false;
