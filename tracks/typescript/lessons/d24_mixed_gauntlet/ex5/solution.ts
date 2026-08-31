// d24_mixed_gauntlet / ex5 - unknown in, a union out.
// See lessons/d24_mixed_gauntlet/README.md, "ex5".
//
// The stub promises unknown and throws, so the caller cannot
// narrow what it gets back.

export type Command =
  | { type: "add"; item: string }
  | { type: "remove"; id: number }
  | { type: "clear" };

export function parseCommand(input: unknown): unknown {
  throw new Error("ex5: parseCommand() is not implemented yet - edit this file.");
}
