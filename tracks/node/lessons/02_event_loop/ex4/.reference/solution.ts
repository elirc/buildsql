// 02_event_loop / ex4 - reference solution (author only, used by `dojo verify`).

export async function processInBatches(
  items: readonly number[],
  batchSize: number,
  handle: (item: number) => void,
): Promise<number> {
  let yields = 0;
  for (let start = 0; start < items.length; start += batchSize) {
    for (const item of items.slice(start, start + batchSize)) {
      handle(item);
    }
    yields += 1;
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
  return yields;
}
