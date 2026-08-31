// d04_interfaces_aliases / ex1 - reference solution (author only).

export interface Person {
  name: string;
}

export interface Player extends Person {
  rating: number;
  federation?: string;
}

export function describePlayer(player: Player): string {
  const badge = player.federation ? ` (${player.federation})` : "";
  return `${player.name}${badge}, ${player.rating}`;
}
