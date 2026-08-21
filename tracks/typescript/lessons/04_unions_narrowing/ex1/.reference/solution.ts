// 04_unions_narrowing / ex1 - reference solution (author only).

export function formatCell(value: string | number | boolean): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return value.toFixed(1);
  }
  return value ? "yes" : "no";
}
