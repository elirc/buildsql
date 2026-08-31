// d20_satisfies_asconst / ex8 - a flag spec that types its own defaults.
// See lessons/d20_satisfies_asconst/README.md, "ex8".
//
// The stub annotates the spec, so FlagName is string, Flags
// becomes an index signature, and defaults() throws.

export const FLAGS: Record<
  string,
  { kind: "boolean" | "number" | "string"; default: boolean | number | string }
> = {
  verbose: { kind: "boolean", default: false },
  retries: { kind: "number", default: 3 },
  out: { kind: "string", default: "dist" },
};

export type FlagName = keyof typeof FLAGS;

export type Flags = {
  [K in FlagName]: (typeof FLAGS)[K]["kind"] extends "boolean"
    ? boolean
    : (typeof FLAGS)[K]["kind"] extends "number"
      ? number
      : string;
};

export function defaults(): Flags {
  throw new Error("ex8: defaults() is not implemented yet - edit this file.");
}
