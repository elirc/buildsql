// d15_conditional_types / ex4 - name the family.
// See lessons/d15_conditional_types/README.md, "ex4".
//
// The stub asks one question and gives up. It is also in the
// wrong order for the array case, which is the trap.

export type Kind<T> = T extends object ? "object" : "other";
