// d15_conditional_types / ex7 - is it any.
// See lessons/d15_conditional_types/README.md, "ex7".
//
// The stub asks a question any type can answer yes to, so it
// says true about everything.

export type IsAny<T> = T extends unknown ? true : false;
