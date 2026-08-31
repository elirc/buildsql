// d04_interfaces_aliases / ex6 - implement a declared contract.
// See lessons/d04_interfaces_aliases/README.md, "ex6".
//
// The class below does not say `implements Ledger`, and one of its return
// types is wrong. Fix both, then implement the three methods.

export interface Ledger {
  record(white: string, black: string, points: number): void;
  pointsFor(player: string): number;
  standings(): { player: string; points: number }[];
}

export class ArrayLedger {
  record(white: string, black: string, points: number): void {
    throw new Error("ex6: ArrayLedger.record() is not implemented yet - edit this file.");
  }

  pointsFor(player: string): number {
    throw new Error("ex6: ArrayLedger.pointsFor() is not implemented yet - edit this file.");
  }

  standings(): string[] {
    throw new Error("ex6: ArrayLedger.standings() is not implemented yet - edit this file.");
  }
}
