// d12_fs_ops / ex2 - reference solution (author only, used by `dojo verify`).
import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

export interface CopyOptions {
  skip?: (relativePath: string) => boolean;
}

export async function copyTree(
  src: string,
  dest: string,
  options: CopyOptions = {},
): Promise<string[]> {
  const skip = options.skip ?? (() => false);
  const copied: string[] = [];

  // The relative path is carried as a forward-slash string and only turned
  // into a real path when the filesystem needs one. That way the values that
  // go into `copied` are portable by construction.
  const walk = async (relative: string): Promise<void> => {
    const from = relative === "" ? src : path.join(src, ...relative.split("/"));

    for (const entry of await readdir(from, { withFileTypes: true })) {
      const child = relative === "" ? entry.name : `${relative}/${entry.name}`;
      if (skip(child)) continue;

      const target = path.join(dest, ...child.split("/"));
      if (entry.isDirectory()) {
        await mkdir(target, { recursive: true });
        await walk(child);
      } else if (entry.isFile()) {
        await copyFile(path.join(from, entry.name), target);
        copied.push(child);
      }
    }
  };

  await mkdir(dest, { recursive: true });
  await walk("");
  return copied.sort();
}
