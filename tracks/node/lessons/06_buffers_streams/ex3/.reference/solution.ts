// 06_buffers_streams / ex3 - reference solution (author only, used by `dojo verify`).
import { Readable } from "node:stream";

export function createCounter(limit: number): Readable {
  let next = 1;

  return new Readable({
    read() {
      if (next > limit) {
        this.push(null);
        return;
      }
      this.push(String(next));
      next += 1;
    },
  });
}
