// d04_interfaces_aliases / ex4 - reference solution (author only).

export interface OpeningStats {
  total: number;
  [opening: string]: number;
}

export function topOpening(stats: OpeningStats): string {
  let best = "";
  let bestCount = -1;
  for (const [opening, count] of Object.entries(stats)) {
    if (opening === "total") {
      continue;
    }
    if (count > bestCount || (count === bestCount && opening < best)) {
      best = opening;
      bestCount = count;
    }
  }
  return best;
}
