// d17_backpressure / ex6 - reference solution (author only, used by `dojo verify`).
import type { Writable } from "node:stream";

export async function writeAllOrAbort(
  writable: Writable,
  chunks: readonly unknown[],
  signal: AbortSignal,
): Promise<void> {
  // Before anything is written, not inside the loop: the first chunk of a
  // cancelled upload is still a chunk nobody wanted.
  if (signal.aborted) throw signal.reason;

  let rejectOnAbort: (reason: unknown) => void = () => {};
  const aborted = new Promise<never>((_resolve, reject) => {
    rejectOnAbort = reject;
  });
  // Nobody may await this on the happy path, so it must never be "unhandled".
  aborted.catch(() => {});
  const onAbort = (): void => rejectOnAbort(signal.reason);
  signal.addEventListener("abort", onAbort, { once: true });

  const drained = (): Promise<void> =>
    new Promise<void>((resolve, reject) => {
      const cleanup = (): void => {
        writable.off("drain", onDrain);
        writable.off("error", onError);
      };
      const onDrain = (): void => {
        cleanup();
        resolve();
      };
      const onError = (error: Error): void => {
        cleanup();
        reject(error);
      };
      writable.once("drain", onDrain);
      writable.once("error", onError);
      // An abort has to win the race, or the call waits for a drain that a
      // stalled sink is never going to send.
      aborted.catch((reason: unknown) => {
        cleanup();
        reject(reason);
      });
    });

  try {
    for (const chunk of chunks) {
      if (signal.aborted) throw signal.reason;
      if (!writable.write(chunk)) await drained();
    }
  } finally {
    signal.removeEventListener("abort", onAbort);
  }
}
