// d20_satisfies_asconst / ex8 - reference solution (author only).

export const FLAGS = {
  verbose: { kind: "boolean", default: false },
  retries: { kind: "number", default: 3 },
  out: { kind: "string", default: "dist" },
} as const satisfies Record<
  string,
  { kind: "boolean" | "number" | "string"; default: boolean | number | string }
>;

export type FlagName = keyof typeof FLAGS;

export type Flags = {
  [K in FlagName]: (typeof FLAGS)[K]["kind"] extends "boolean"
    ? boolean
    : (typeof FLAGS)[K]["kind"] extends "number"
      ? number
      : string;
};

export function defaults(): Flags {
  return {
    verbose: FLAGS.verbose.default,
    retries: FLAGS.retries.default,
    out: FLAGS.out.default,
  };
}
