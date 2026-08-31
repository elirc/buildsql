// d12_fs_ops / ex6 - reference solution (author only, used by `dojo verify`).
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export async function withTempWorkspace<T>(
  run: (dir: string) => Promise<T>,
): Promise<T> {
  // mkdtemp appends random characters to the prefix and creates the directory
  // in one step - so two callers can never collide, even back to back.
  const dir = await mkdtemp(path.join(tmpdir(), "dojo-workspace-"));

  try {
    return await run(dir);
  } finally {
    // finally, not a line after the call: the cleanup has to happen on the
    // failure path too, and that is the path a half-written workspace is on.
    // force ignores an already-missing directory.
    await rm(dir, { recursive: true, force: true });
  }
}
