// d06_narrowing_guards / ex3 - reference solution (author only).

export interface Point {
  x: number;
  y: number;
}

export function isPoint(value: unknown): value is Point {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate = value as { x?: unknown; y?: unknown };
  return typeof candidate.x === "number" && typeof candidate.y === "number";
}
