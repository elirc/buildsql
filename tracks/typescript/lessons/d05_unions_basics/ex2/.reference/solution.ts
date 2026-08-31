// d05_unions_basics / ex2 - reference solution (author only).

export function toCellText(value: string | number | null): string {
  if (value === null) {
    return "-";
  }
  if (typeof value === "number") {
    return String(value);
  }
  const trimmed = value.trim();
  return trimmed === "" ? "-" : trimmed;
}
