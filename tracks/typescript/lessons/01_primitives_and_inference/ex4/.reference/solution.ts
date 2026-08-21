// 01_primitives_and_inference / ex4 - reference solution (author only).

export function zip(names: string[], scores: number[]): [string, number][] {
  const pairs: [string, number][] = [];
  const length = Math.min(names.length, scores.length);
  for (let i = 0; i < length; i++) {
    pairs.push([names[i], scores[i]]);
  }
  return pairs;
}
