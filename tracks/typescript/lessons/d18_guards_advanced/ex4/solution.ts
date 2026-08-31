// d18_guards_advanced / ex4 - assert a row or throw.
// See lessons/d18_guards_advanced/README.md, "ex4".
//
// The stub returns void and throws unconditionally, so it never
// narrows and never passes.

export interface Row {
  id: string;
  amount: number;
}

export function assertRow(value: unknown): void {
  throw new Error("ex4: assertRow() is not implemented yet - edit this file.");
}
