// d06_narrowing_guards / ex2 - reference solution (author only).

export type ValueKind =
  | "string"
  | "number"
  | "boolean"
  | "undefined"
  | "null"
  | "array"
  | "object"
  | "function";

export function kindOf(value: unknown): ValueKind {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  const kind = typeof value;
  if (kind === "bigint" || kind === "symbol") {
    return "object";
  }
  return kind;
}
