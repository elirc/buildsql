// d16_transform_pipeline / ex8 - reference solution (author only, used by `dojo verify`).
import type { Readable, Writable } from "node:stream";
import { finished } from "node:stream/promises";

export async function partitionTo<T>(
  source: Readable,
  keyOf: (item: T) => string,
  openSink: (key: string) => Writable,
): Promise<Record<string, number>> {
  const sinks = new Map<string, Writable>();
  const counts: Record<string, number> = {};
  const runs: Promise<void>[] = [];
  let failure: unknown = null;

  const fail = (error: unknown): void => {
    if (failure === null) failure = error;
    source.destroy();
    // Destroyed, not ended: an ended sink claims to be a complete file.
    for (const sink of sinks.values()) sink.destroy();
  };

  try {
    for await (const item of source) {
      if (failure !== null) break;
      const key = keyOf(item as T);

      let sink = sinks.get(key);
      if (sink === undefined) {
        // Lazily, and once per key - openSink() is a file being created.
        sink = openSink(key);
        sinks.set(key, sink);
        const run = finished(sink);
        run.catch((error: unknown) => fail(error));
        runs.push(run);
      }

      sink.write(item);
      counts[key] = (counts[key] ?? 0) + 1;
    }
  } catch (error) {
    fail(error);
  }

  if (failure === null) {
    for (const sink of sinks.values()) sink.end();
  }

  // allSettled, because on the failure path several of these have rejected and
  // it is the first failure the caller wants, not whichever settled last.
  const settled = await Promise.allSettled(runs);
  if (failure !== null) throw failure;

  const rejected = settled.find((result) => result.status === "rejected");
  if (rejected !== undefined && rejected.status === "rejected") throw rejected.reason;

  return counts;
}
