// d22_declaration_files / ex2 - two signatures, one function.
// See lessons/d22_declaration_files/README.md, "ex2".
//
// The stub has a single signature whose return type is widened
// to a plain string kind, so a caller learns nothing from the argument.

export function box(value: string | number): { kind: string; value: string | number } {
  throw new Error("ex2: box() is not implemented yet - edit this file.");
}
