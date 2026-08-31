// d04_interfaces_aliases / ex5 - two declarations, one interface.
// See lessons/d04_interfaces_aliases/README.md, "ex5".

// --- shipped by the club library. Do not edit this declaration. ---
export interface ClubConfig {
  name: string;
}
// -----------------------------------------------------------------

// Add a SECOND `export interface ClubConfig` declaration here, contributing
// `maxPlayers: number` and `rated: boolean`. Two declarations of one interface
// merge; two declarations of one `type` alias are an error.

export function describeClub(config: ClubConfig): string {
  throw new Error("ex5: describeClub() is not implemented yet - edit this file.");
}
