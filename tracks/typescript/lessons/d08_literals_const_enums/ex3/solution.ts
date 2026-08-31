// d08_literals_const_enums / ex3 - a string enum, not an object.
// See lessons/d08_literals_const_enums/README.md, "ex3".
//
// Replace the object-plus-alias below with a real `enum Lane`.

export const Lane = { Left: "left", Center: "center", Right: "right" };

export type Lane = string;

export function laneOffset(lane: Lane): number {
  throw new Error("ex3: laneOffset() is not implemented yet - edit this file.");
}

export function shift(lane: Lane, by: number): Lane {
  throw new Error("ex3: shift() is not implemented yet - edit this file.");
}
