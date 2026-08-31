// d14_mapped_types / ex7 - swap keys and values.
// See lessons/d14_mapped_types/README.md, "ex7".
//
// Invert<{ ok: "OK" }> should be { OK: "ok" }: the values become the keys
// and the keys become the values. This version keeps the keys where they
// were and only pretends.

export type Invert<T extends Record<string, PropertyKey>> = { [K in keyof T]: K };
