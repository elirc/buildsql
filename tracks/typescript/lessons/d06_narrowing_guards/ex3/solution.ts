// d06_narrowing_guards / ex3 - a structural guard over unknown.
// See lessons/d06_narrowing_guards/README.md, "ex3".

export interface Point {
  x: number;
  y: number;
}

export function isPoint(value: unknown): boolean {
  throw new Error("ex3: isPoint() is not implemented yet - edit this file.");
}
