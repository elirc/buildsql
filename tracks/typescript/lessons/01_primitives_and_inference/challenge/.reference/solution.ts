// 01_primitives_and_inference / challenge - reference solution (author only).

export function splitEvery(values: readonly number[], size: number): number[][] {
  if (!Number.isInteger(size) || size < 1) {
    return [];
  }
  const chunks: number[][] = [];
  for (let i = 0; i < values.length; i += size) {
    chunks.push(values.slice(i, i + size));
  }
  return chunks;
}
