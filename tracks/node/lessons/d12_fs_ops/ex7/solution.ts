// d12_fs_ops / ex7 - make one directory look like another.
// See lessons/d12_fs_ops/README.md, "Problem 7".

export interface SyncReport {
  /** in src, not in dest */
  copied: string[];
  /** in both, different size */
  updated: string[];
  /** in dest, not in src */
  deleted: string[];
}

/**
 * Files only, compared by SIZE. All three lists are relative to their root,
 * forward slashes, sorted. A file that matches appears in none of them.
 */
export async function syncDirectories(src: string, dest: string): Promise<SyncReport> {
  throw new Error("ex7: syncDirectories() is not implemented yet - edit this file.");
}
