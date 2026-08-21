// 01_primitives_and_inference / ex1 - reference solution (author only).

export function averageScore(scores: number[]): number {
  if (scores.length === 0) {
    return 0;
  }
  let total = 0;
  for (const score of scores) {
    total += score;
  }
  return total / scores.length;
}
