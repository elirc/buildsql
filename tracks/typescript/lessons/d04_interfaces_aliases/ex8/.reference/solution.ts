// d04_interfaces_aliases / ex8 - reference solution (author only).

export interface Match {
  readonly white: string;
  readonly black: string;
  readonly winner?: string;
}

export interface Round {
  readonly name: string;
  readonly matches: readonly Match[];
}

export function nextRound(round: Round, name: string): Round {
  const winners: string[] = [];
  for (const match of round.matches) {
    if (match.winner !== undefined) {
      winners.push(match.winner);
    }
  }
  const matches: Match[] = [];
  for (let i = 0; i < winners.length; i += 2) {
    const white = winners[i];
    const black = winners[i + 1];
    if (black === undefined) {
      matches.push({ white, black: "", winner: white });
    } else {
      matches.push({ white, black });
    }
  }
  return { name, matches };
}
