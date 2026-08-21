// 04_unions_narrowing / ex2 - a discriminated union.
// See lessons/04_unions_narrowing/README.md, "Exercise 2".
//
// One variant is written for you. Two are missing, and describeEvent() has to
// render all three.

export type DojoEvent = { kind: "pass"; exercise: string; attempts: number };

export function describeEvent(event: DojoEvent): string {
  throw new Error("ex2: describeEvent() is not implemented yet - edit this file.");
}
