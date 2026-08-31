// d01_annotations_inference / ex8 - reference solution (author only).

export function runLengths(values: readonly number[]): [value: number, count: number][] {
  const runs: [value: number, count: number][] = [];
  for (const value of values) {
    const last = runs[runs.length - 1];
    if (last !== undefined && last[0] === value) {
      last[1] += 1;
    } else {
      runs.push([value, 1]);
    }
  }
  return runs;
}
