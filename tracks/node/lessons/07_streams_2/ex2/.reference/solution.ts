// 07_streams_2 / ex2 - reference solution (author only, used by `dojo verify`).
import type { Readable, Transform, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";

export async function pipeThrough(
  source: Readable,
  transforms: Transform[],
  sink: Writable,
): Promise<void> {
  await pipeline([source, ...transforms, sink]);
}
