// d17_template_literal_types / ex1 - one name from two.
// See lessons/d17_template_literal_types/README.md, "ex1".
//
// The stub forgets the separator, which is the only part of
// this type that is not automatic.

export type Prefixed<P extends string, K extends string> = `${P}${K}`;
