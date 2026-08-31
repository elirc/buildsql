// d17_backpressure / ex1 - reference solution (author only, used by `dojo verify`).
import type { Writable } from "node:stream";

export function writeAndWait(writable: Writable, chunk: unknown): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // The one boolean everybody ignores. True means "there is room, carry on".
    if (writable.write(chunk)) {
      resolve();
      return;
    }

    const cleanup = (): void => {
      writable.off("drain", onDrain);
      writable.off("error", onError);
      writable.off("close", onClose);
    };
    const onDrain = (): void => {
      cleanup();
      resolve();
    };
    const onError = (error: Error): void => {
      cleanup();
      reject(error);
    };
    // A stream that closes without draining would leave this promise pending
    // for the rest of the process, which is a hang with no error anywhere.
    const onClose = (): void => {
      cleanup();
      reject(new Error("the stream closed before it drained"));
    };

    writable.once("drain", onDrain);
    writable.once("error", onError);
    writable.once("close", onClose);
  });
}
