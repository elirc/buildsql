// d04_interfaces_aliases / ex3 - reference solution (author only).

export interface Scorer {
  (white: number, black: number): string;
  label: string;
  total: number;
}

export function makeScorer(label: string): Scorer {
  const scorer: Scorer = Object.assign(
    (white: number, black: number): string => {
      scorer.total += 1;
      return `${white}-${black}`;
    },
    { label, total: 0 },
  );
  return scorer;
}
