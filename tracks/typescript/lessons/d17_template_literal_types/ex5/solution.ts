// d17_template_literal_types / ex5 - cut a string into a tuple.
// See lessons/d17_template_literal_types/README.md, "ex5".
//
// The stub never splits anything: it wraps the whole string in a
// one-element tuple, which is only the base case.

export type Split<S extends string, D extends string> = [S];
