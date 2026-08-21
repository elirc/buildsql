// 02_functions / ex4 - reference solution (author only).

export function duplicate(value: string): string;
export function duplicate(value: number): number;
export function duplicate(value: string | number): string | number {
  if (typeof value === "string") {
    return value + value;
  }
  return value * 2;
}
