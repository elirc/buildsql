// d13_implement_utilities / ex1 - rebuild Readonly<T> from scratch.
// See lessons/d13_implement_utilities/README.md, "ex1".
//
// A clone that locks nothing. Write the mapped type that locks every member.

export type MyReadonly<T> = T;
