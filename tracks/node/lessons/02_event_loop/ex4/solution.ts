// 02_event_loop / ex4 - do not hold the loop hostage.
// See lessons/02_event_loop/README.md, "Exercise 4".

export async function processInBatches(
  items: readonly number[],
  batchSize: number,
  handle: (item: number) => void,
): Promise<number> {
  throw new Error("ex4: processInBatches() is not implemented yet - edit this file.");
}
