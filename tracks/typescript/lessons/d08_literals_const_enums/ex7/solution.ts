// d08_literals_const_enums / ex7 - an exhaustive table, and negative steps.
// See lessons/d08_literals_const_enums/README.md, "ex7".
//
// With Light as `string`, the Record below is an open index signature and it
// would not notice a missing lamp.

export type Light = string;

export const NEXT: Record<Light, Light> = { red: "green", green: "amber", amber: "red" };

export function cycle(start: Light, steps: number): Light {
  throw new Error("ex7: cycle() is not implemented yet - edit this file.");
}
