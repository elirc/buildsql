// d07_discriminated_unions / ex1 - the tag has to be a literal.
// See lessons/d07_discriminated_unions/README.md, "ex1".
//
// `kind: string` compiles and narrows nothing. Pin each one.

export type Cmd =
  | { kind: string; cents: number }
  | { kind: string; slot: string }
  | { kind: string };

export function describeCommand(cmd: Cmd): string {
  throw new Error("ex1: describeCommand() is not implemented yet - edit this file.");
}
