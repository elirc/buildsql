// d16_infer_patterns / ex6 - the state a store publishes.
// See lessons/d16_infer_patterns/README.md, "ex6".
//
// The stub captures the subscribe member itself, which is a
// function type, not the state.

export type StateOf<T> = T extends { subscribe: infer S } ? S : never;
