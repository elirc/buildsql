// d08_literals_const_enums / ex4 - a numeric enum, for its reverse map.
// See lessons/d08_literals_const_enums/README.md, "ex4".
//
// A plain object has no reverse mapping, so nameOf() cannot be written against
// the declaration below. Replace it with a numeric `enum Level`.

export const Level = { Debug: 10, Info: 20, Warn: 30, Error: 40 };

export type Level = number;

export function atLeast(level: Level, min: Level): boolean {
  throw new Error("ex4: atLeast() is not implemented yet - edit this file.");
}

export function nameOf(level: Level): string {
  throw new Error("ex4: nameOf() is not implemented yet - edit this file.");
}
