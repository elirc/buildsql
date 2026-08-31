// d24_mixed_gauntlet / ex3 - reference solution (author only, used by `dojo verify`).
import { open } from "node:fs/promises";

const BLOCK = 64;

export async function tailLines(file: string, n: number): Promise<string[]> {
  if (n <= 0) return [];

  const handle = await open(file, "r");
  try {
    const { size } = await handle.stat();
    if (size === 0) return [];

    const blocks: Buffer[] = [];
    let position = size;
    let newlines = 0;

    // Keep walking back until there are more newlines than lines wanted: the
    // extra one is what proves the first line in the region is complete.
    while (position > 0 && newlines <= n) {
      const length = Math.min(BLOCK, position);
      position -= length;
      const buffer = Buffer.alloc(length);
      await handle.read(buffer, 0, length, position);
      blocks.unshift(buffer);
      for (const byte of buffer) if (byte === 0x0a) newlines += 1;
    }

    // Concatenate the BYTES and decode once: a block boundary lands in the
    // middle of a multi-byte character sooner or later.
    const text = Buffer.concat(blocks).toString("utf8");
    const lines = text.split("\n").map((line) => line.replace(/\r$/, ""));
    if (lines[lines.length - 1] === "") lines.pop();
    return lines.slice(Math.max(0, lines.length - n));
  } finally {
    await handle.close();
  }
}
