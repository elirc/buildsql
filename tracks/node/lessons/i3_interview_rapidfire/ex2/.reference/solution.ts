// i3_interview_rapidfire / ex2 - reference solution (author only, used by `dojo verify`).
import { once } from "node:events";
import type { Writable } from "node:stream";

export async function pumpAll(
  source: AsyncIterable<string | Buffer>,
  dest: Writable,
): Promise<number> {
  let written = 0;

  for await (const chunk of source) {
    written += 1;
    if (!dest.write(chunk)) {
      await once(dest, "drain");
    }
  }

  return written;
}
