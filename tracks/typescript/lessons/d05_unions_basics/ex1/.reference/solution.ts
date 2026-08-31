// d05_unions_basics / ex1 - reference solution (author only).

export function cellWidth(value: string | number): number {
  if (typeof value === "string") {
    return value.trim().length;
  }
  return String(Math.abs(value)).replace(".", "").length;
}
