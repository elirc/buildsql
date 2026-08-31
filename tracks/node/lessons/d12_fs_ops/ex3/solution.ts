// d12_fs_ops / ex3 - how big is that directory.
// See lessons/d12_fs_ops/README.md, "Problem 3".

export interface DirStats {
  files: number;
  bytes: number;
}

/** Recursive. Files only: directories are traversed, never counted. */
export async function dirStats(dir: string): Promise<DirStats> {
  throw new Error("ex3: dirStats() is not implemented yet - edit this file.");
}
