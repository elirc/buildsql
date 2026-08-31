// d17_template_literal_types / ex8 - read the params out of a path.
// See lessons/d17_template_literal_types/README.md, "ex8".
//
// The stub allows any key at all, which is exactly the typing a
// router is supposed to replace.

export type RouteParams<S extends string> = Record<string, string>;
