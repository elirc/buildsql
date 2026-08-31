// d18_guards_advanced / ex4 - reference solution (author only).

export interface Row {
  id: string;
  amount: number;
}

export function assertRow(value: unknown): asserts value is Row {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("assertRow: expected an object, received " + String(value));
  }
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string") {
    throw new TypeError("assertRow: field id must be a string");
  }
  if (typeof row.amount !== "number") {
    throw new TypeError("assertRow: field amount must be a number");
  }
}
