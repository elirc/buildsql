// d04_interfaces_aliases / ex8 - readonly nested interfaces.
// See lessons/d04_interfaces_aliases/README.md, "ex8".
//
// Five `readonly` modifiers are missing below - three on Match, two on Round
// (one of which is on the array's element type, not on the property).

export interface Match {
  white: string;
  black: string;
  winner?: string;
}

export interface Round {
  name: string;
  matches: Match[];
}

export function nextRound(round: Round, name: string): Round {
  throw new Error("ex8: nextRound() is not implemented yet - edit this file.");
}
