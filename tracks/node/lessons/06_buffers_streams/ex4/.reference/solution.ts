// 06_buffers_streams / ex4 - reference solution (author only, used by `dojo verify`).
import { Writable } from "node:stream";

export interface Collector {
  writable: Writable;
  text(): string;
}

export function createCollector(): Collector {
  const chunks: Buffer[] = [];

  const writable = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      chunks.push(Buffer.from(chunk));
      callback();
    },
  });

  return {
    writable,
    text: () => Buffer.concat(chunks).toString("utf8"),
  };
}
