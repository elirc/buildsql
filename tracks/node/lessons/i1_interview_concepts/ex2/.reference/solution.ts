// i1_interview_concepts / ex2 - reference solution (author only, used by `dojo verify`).

export async function sumWithoutBlocking(
  values: readonly number[],
  chunkSize: number,
  onProgress: (processed: number) => void,
): Promise<number> {
  let total = 0;
  let processed = 0;

  for (let start = 0; start < values.length; start += chunkSize) {
    for (const value of values.slice(start, start + chunkSize)) {
      total += value;
      processed += 1;
    }
    onProgress(processed);
    await new Promise<void>((resolve) => setImmediate(resolve));
  }

  return total;
}
