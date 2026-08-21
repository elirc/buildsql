// 05_literals_enums / ex1 - a type with exactly three values.
// See lessons/05_literals_enums/README.md, "Exercise 1".
//
// `string` has far too many values to be this type.

export type Level = string;

export function nextLevel(level: Level): Level {
  throw new Error("ex1: nextLevel() is not implemented yet - edit this file.");
}
