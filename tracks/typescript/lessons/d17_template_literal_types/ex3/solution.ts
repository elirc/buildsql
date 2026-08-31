// d17_template_literal_types / ex3 - does it start with that.
// See lessons/d17_template_literal_types/README.md, "ex3".
//
// The stub tests for equality, not for a prefix, so only an
// exact match comes back true.

export type StartsWith<S extends string, P extends string> = S extends P ? true : false;
