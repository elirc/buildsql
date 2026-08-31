// d04_interfaces_aliases / ex5 - reference solution (author only).

// --- shipped by the club library. Do not edit this declaration. ---
export interface ClubConfig {
  name: string;
}
// -----------------------------------------------------------------

export interface ClubConfig {
  maxPlayers: number;
  rated: boolean;
}

export function describeClub(config: ClubConfig): string {
  const kind = config.rated ? "rated" : "casual";
  return `${config.name}: up to ${config.maxPlayers} players, ${kind}`;
}
