// d04_interfaces_aliases / ex1 - extend an interface, then read both halves.
// See lessons/d04_interfaces_aliases/README.md, "ex1".

export interface Person {
  name: string;
}

export interface Player extends Person {
  rating: unknown;
  federation?: string;
}

export function describePlayer(player: Player): string {
  throw new Error("ex1: describePlayer() is not implemented yet - edit this file.");
}
