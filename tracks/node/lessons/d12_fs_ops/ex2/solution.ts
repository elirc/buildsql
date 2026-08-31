// d12_fs_ops / ex2 - copying a tree, minus the parts you do not want.
// See lessons/d12_fs_ops/README.md, "Problem 2".

export interface CopyOptions {
  /**
   * Called with the path of every entry relative to `src`, forward slashes.
   * Returning true excludes it - and for a directory, everything inside it.
   */
  skip?: (relativePath: string) => boolean;
}

/**
 * Copy `src` into `dest`, recursively. Returns the relative paths of the files
 * copied, with forward slashes, sorted.
 */
export async function copyTree(
  src: string,
  dest: string,
  options?: CopyOptions,
): Promise<string[]> {
  throw new Error("ex2: copyTree() is not implemented yet - edit this file.");
}
