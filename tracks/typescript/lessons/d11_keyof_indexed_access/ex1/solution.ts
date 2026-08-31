// d11_keyof_indexed_access / ex1 - the canonical keyof signature.
// See lessons/d11_keyof_indexed_access/README.md, "ex1".
//
// The constraint is there and the return type throws the answer away.

export function getValue<T, K extends keyof T>(source: T, key: K): unknown {
  throw new Error("ex1: getValue() is not implemented yet - edit this file.");
}
