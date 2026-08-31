// d17_template_literal_types / ex7 - snake_case to camelCase.
// See lessons/d17_template_literal_types/README.md, "ex7".
//
// The stub returns the name unchanged, which is right only for
// names that contain no underscore.

export type SnakeToCamel<S extends string> = S;
