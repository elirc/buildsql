// d04_interfaces_aliases / ex2 - an intersection of two aliases.
// See lessons/d04_interfaces_aliases/README.md, "ex2".
//
// GameRecord below is only half of what it should be.

export interface Game {
  white: string;
  black: string;
  moves: number;
}

export type Timestamped = {
  createdAt: string;
};

export type GameRecord = Game;

export function stamp(game: Game, createdAt: string): GameRecord {
  throw new Error("ex2: stamp() is not implemented yet - edit this file.");
}
