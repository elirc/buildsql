// d12_fs_ops / ex6 - borrow a directory, give it back.
// See lessons/d12_fs_ops/README.md, "Problem 6".

/**
 * Create a fresh directory under the OS temp dir, hand it to `run`, and remove
 * it afterwards - on both the success and the failure path. The value comes
 * back to the caller; so does a rejection, unchanged.
 */
export async function withTempWorkspace<T>(
  run: (dir: string) => Promise<T>,
): Promise<T> {
  throw new Error("ex6: withTempWorkspace() is not implemented yet - edit this file.");
}
