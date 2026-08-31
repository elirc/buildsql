// d17_template_literal_types / ex4 - cut the prefix off.
// See lessons/d17_template_literal_types/README.md, "ex4".
//
// The stub returns the string untouched, which is correct only
// when the prefix is absent.

export type StripPrefix<S extends string, P extends string> = S;
