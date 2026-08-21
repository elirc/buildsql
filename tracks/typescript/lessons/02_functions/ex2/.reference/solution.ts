// 02_functions / ex2 - reference solution (author only).

export function bestOf(...scores: number[]): number {
  let best = 0;
  for (const score of scores) {
    if (score > best) {
      best = score;
    }
  }
  return best;
}
