// d07_discriminated_unions / ex6 - construct the union instead of consuming it.
// See lessons/d07_discriminated_unions/README.md, "ex6".

export type Token =
  | { kind: string; value: number }
  | { kind: string; value: string }
  | { kind: string; value: string };

export function tokenise(input: string): Token[] {
  throw new Error("ex6: tokenise() is not implemented yet - edit this file.");
}
