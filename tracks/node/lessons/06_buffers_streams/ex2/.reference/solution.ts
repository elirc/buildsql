// 06_buffers_streams / ex2 - reference solution (author only, used by `dojo verify`).
import type { Readable } from "node:stream";

export async function collect(source: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of source) {
    chunks.push(Buffer.from(chunk as Buffer));
  }
  return Buffer.concat(chunks);
}
