// d12_fs_ops / ex3 - reference solution (author only, used by `dojo verify`).
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

export interface DirStats {
  files: number;
  bytes: number;
}

export async function dirStats(dir: string): Promise<DirStats> {
  let files = 0;
  let bytes = 0;

  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // The recursive call returns the same shape, so the totals just add up.
      const nested = await dirStats(full);
      files += nested.files;
      bytes += nested.bytes;
    } else if (entry.isFile()) {
      files += 1;
      bytes += (await stat(full)).size;
    }
  }

  return { files, bytes };
}
