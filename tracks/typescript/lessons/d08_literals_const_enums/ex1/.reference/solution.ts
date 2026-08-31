// d08_literals_const_enums / ex1 - reference solution (author only).

export type Direction = "north" | "east" | "south" | "west";

const CLOCKWISE: readonly Direction[] = ["north", "east", "south", "west"];

export function turnRight(direction: Direction): Direction {
  return CLOCKWISE[(CLOCKWISE.indexOf(direction) + 1) % CLOCKWISE.length];
}
