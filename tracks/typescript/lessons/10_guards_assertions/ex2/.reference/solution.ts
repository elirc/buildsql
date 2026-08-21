// 10_guards_assertions / ex2 - reference solution (author only).

export function assertIsStringArray(value: unknown): asserts value is string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error("expected an array of strings");
  }
}
