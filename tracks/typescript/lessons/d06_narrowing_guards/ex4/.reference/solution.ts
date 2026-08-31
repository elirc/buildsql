// d06_narrowing_guards / ex4 - reference solution (author only).

export function assertIsRecord(value: unknown): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("expected a plain object");
  }
}
