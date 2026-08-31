// d06_narrowing_guards / ex2 - eight labels, two of which typeof gets wrong.
// See lessons/d06_narrowing_guards/README.md, "ex2".

export type ValueKind = string;

export function kindOf(value: unknown): ValueKind {
  throw new Error("ex2: kindOf() is not implemented yet - edit this file.");
}
