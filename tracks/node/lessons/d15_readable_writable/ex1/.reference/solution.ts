// d15_readable_writable / ex1 - reference solution (author only, used by `dojo verify`).
import { Readable } from "node:stream";

export function createRangeStream(from: number, to: number, step: number): Readable {
  let current = from;
  return new Readable({
    objectMode: true,
    read() {
      // Past the end - including immediately, for an empty range - is the one
      // signal a Readable owes its consumer: push(null) or they wait forever.
      if (current > to) {
        this.push(null);
        return;
      }
      const value = current;
      current += step;
      this.push(value);
    },
  });
}
