// d04_interfaces_aliases / ex6 - reference solution (author only).

export interface Ledger {
  record(white: string, black: string, points: number): void;
  pointsFor(player: string): number;
  standings(): { player: string; points: number }[];
}

export class ArrayLedger implements Ledger {
  private readonly points = new Map<string, number>();

  private add(player: string, amount: number): void {
    this.points.set(player, (this.points.get(player) ?? 0) + amount);
  }

  record(white: string, black: string, points: number): void {
    this.add(white, points);
    this.add(black, 1 - points);
  }

  pointsFor(player: string): number {
    return this.points.get(player) ?? 0;
  }

  standings(): { player: string; points: number }[] {
    return [...this.points.entries()]
      .map(([player, points]) => ({ player, points }))
      .sort((a, b) => (b.points - a.points) || (a.player < b.player ? -1 : a.player > b.player ? 1 : 0));
  }
}
