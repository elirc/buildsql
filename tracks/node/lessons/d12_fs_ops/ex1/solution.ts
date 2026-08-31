// d12_fs_ops / ex1 - a write a reader can never catch half-finished.
// See lessons/d12_fs_ops/README.md, "Problem 1".

/**
 * Write `text` to `file`, creating parent directories as needed.
 *
 * Write to a temporary name in the SAME directory and rename it into place, so
 * a reader sees the old file or the new one and never a partial one. The
 * temporary name must be unique per call, and nothing may be left behind.
 */
export async function writeTextAtomic(file: string, text: string): Promise<void> {
  throw new Error("ex1: writeTextAtomic() is not implemented yet - edit this file.");
}
