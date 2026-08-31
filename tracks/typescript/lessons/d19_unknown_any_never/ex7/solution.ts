// d19_unknown_any_never / ex7 - narrow unknown to JSON.
// See lessons/d19_unknown_any_never/README.md, "ex7".
//
// The stub answers boolean and throws, so nothing narrows and
// nothing runs.

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export function isJsonValue(value: unknown): boolean {
  throw new Error("ex7: isJsonValue() is not implemented yet - edit this file.");
}
