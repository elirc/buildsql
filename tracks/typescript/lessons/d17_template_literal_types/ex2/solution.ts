// d17_template_literal_types / ex2 - capitalise as you prefix.
// See lessons/d17_template_literal_types/README.md, "ex2".
//
// The stub prefixes without capitalising, so it produces
// gettitle rather than getTitle.

export type GetterName<K extends string> = `get${K}`;
