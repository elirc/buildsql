// d15_conditional_types / ex3 - and now do not distribute.
// See lessons/d15_conditional_types/README.md, "ex3".
//
// The stub is ex2's distributive version, which splits the union
// into one array per member.

export type ToArrayAll<T> = T extends unknown ? T[] : never;
