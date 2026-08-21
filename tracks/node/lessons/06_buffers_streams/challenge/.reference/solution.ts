// 06_buffers_streams / challenge - reference solution (author only, used by `dojo verify`).
import { once } from "node:events";
import type { Writable } from "node:stream";

export async function writeAll(writable: Writable, chunks: Buffer[]): Promise<void> {
  for (const chunk of chunks) {
    if (!writable.write(chunk)) {
      // The sink is full: wait for it to catch up before adding more.
      await once(writable, "drain");
    }
  }
}
