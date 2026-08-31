// d06_narrowing_guards / ex1 - reference solution (author only).

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}
