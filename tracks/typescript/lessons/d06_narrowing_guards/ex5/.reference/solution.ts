// d06_narrowing_guards / ex5 - reference solution (author only).

export function toMillis(value: number | string | Date): number {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "number") {
    return value;
  }
  const trimmed = value.trim();
  if (/^-?\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    throw new Error(`cannot read a timestamp from ${value}`);
  }
  return parsed;
}
