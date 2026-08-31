// d19_unknown_any_never / ex8 - reference solution (author only).

export function fail(message: string): never {
  throw new Error(message);
}

export function requirePort(raw: unknown): number {
  const value: unknown = typeof raw === "string" ? Number(raw.trim()) : raw;
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 65535
  ) {
    fail("requirePort: expected a port between 1 and 65535, received " + String(raw));
  }
  return value;
}
