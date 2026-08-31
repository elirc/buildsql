// d20_satisfies_asconst / ex5 - satisfies against as.
// See lessons/d20_satisfies_asconst/README.md, "ex5".
//
// The stub uses a type assertion, which replaces the inferred
// type and would also have hidden a wrong value.

export interface Settings {
  mode: "strict" | "lenient";
  retries: number;
  tags: readonly string[];
}

export const CONFIG = { mode: "strict", retries: 3, tags: ["core"] } as Settings;
