// d15_conditional_types / ex6 - is it never.
// See lessons/d15_conditional_types/README.md, "ex6".
//
// The stub is that naive version. It distributes, and the empty
// union has no members to distribute over.

export type IsNever<T> = T extends never ? true : false;
