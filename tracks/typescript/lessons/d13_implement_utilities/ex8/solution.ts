// d13_implement_utilities / ex8 - merge two object types, second one wins.
// See lessons/d13_implement_utilities/README.md, "ex8".
//
// An intersection is the classic wrong answer: where the two shapes disagree
// about a member, A & B intersects the disagreement into never instead of
// letting B override. Walk the union of keys and choose.

export type Merge<A, B> = A & B;
