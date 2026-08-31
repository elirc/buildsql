// d17_backpressure / ex8 - reference solution (author only, used by `dojo verify`).
import type { Readable, Writable } from "node:stream";

export async function balanceAcross(
  source: Readable,
  sinks: Writable[],
): Promise<number[]> {
  const counts = sinks.map(() => 0);

  const leastLoaded = (): number => {
    let best = 0;
    for (let index = 1; index < sinks.length; index += 1) {
      if (sinks[index].writableLength < sinks[best].writableLength) best = index;
    }
    return best;
  };

  // "Full" is each sink's own highWaterMark, not a number you picked - the
  // sinks already know how much they are prepared to hold.
  const saturated = (): boolean =>
    sinks.every((sink) => sink.writableLength >= sink.writableHighWaterMark);

  const anyDrain = (): Promise<void> =>
    new Promise<void>((resolve, reject) => {
      const cleanup = (): void => {
        for (const sink of sinks) {
          sink.off("drain", onDrain);
          sink.off("error", onError);
        }
      };
      const onDrain = (): void => {
        cleanup();
        resolve();
      };
      const onError = (error: Error): void => {
        cleanup();
        reject(error);
      };
      for (const sink of sinks) {
        sink.once("drain", onDrain);
        sink.once("error", onError);
      }
    });

  for await (const chunk of source) {
    // Waiting here is what pushes the backpressure back up into the source:
    // the for-await loop stops pulling while this promise is pending.
    if (saturated()) await anyDrain();

    const index = leastLoaded();
    sinks[index].write(chunk);
    counts[index] += 1;
  }

  await Promise.all(
    sinks.map((sink) => new Promise<void>((resolve) => sink.end(() => resolve()))),
  );
  return counts;
}
