// d22_declaration_files / ex2 - reference solution (author only).

export function box(value: string): { kind: "text"; value: string };
export function box(value: number): { kind: "count"; value: number };
export function box(value: string | number): {
  kind: "text" | "count";
  value: string | number;
} {
  if (typeof value === "string") {
    return { kind: "text", value };
  }
  return { kind: "count", value };
}
