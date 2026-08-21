// 04_unions_narrowing / ex4 - exhaustiveness, checked by the compiler.
// See lessons/04_unions_narrowing/README.md, "Exercise 4".
//
// The union is complete. What is missing is an area() that covers it and an
// assertNever() whose parameter type makes the compiler do the checking.

export type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "rect"; width: number; height: number };

export function assertNever(value: unknown): never {
  throw new Error(`unhandled variant: ${JSON.stringify(value)}`);
}

export function area(shape: Shape): number {
  throw new Error("ex4: area() is not implemented yet - edit this file.");
}
