// d04_interfaces_aliases / ex2 - reference solution (author only).

export interface Game {
  white: string;
  black: string;
  moves: number;
}

export type Timestamped = {
  createdAt: string;
};

export type GameRecord = Game & Timestamped;

export function stamp(game: Game, createdAt: string): GameRecord {
  return { ...game, createdAt };
}
