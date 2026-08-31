// d15_readable_writable / ex3 - reference solution (author only, used by `dojo verify`).
import { Writable } from "node:stream";

export interface BoundedSink {
  writable: Writable;
  bytes(): number;
}

export function createBoundedSink(limit: number): BoundedSink {
  let accepted = 0;

  const writable = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      // Refuse BEFORE counting: the chunk that breaks the budget is never
      // accepted, so bytes() reports what actually got in.
      if (accepted + chunk.length > limit) {
        callback(
          new Error(`createBoundedSink: refusing to accept more than ${limit} bytes`),
        );
        return;
      }
      accepted += chunk.length;
      callback();
    },
  });

  return { writable, bytes: () => accepted };
}
