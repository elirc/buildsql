// d12_fs_ops / ex4 - reference solution (author only, used by `dojo verify`).
import { readdir, rmdir } from "node:fs/promises";
import path from "node:path";

export async function removeEmptyDirs(root: string): Promise<string[]> {
  const removed: string[] = [];

  /** Returns whether `relative` is empty AFTER its children have been pruned. */
  const visit = async (relative: string): Promise<boolean> => {
    const full = relative === "" ? root : path.join(root, ...relative.split("/"));
    let empty = true;

    for (const entry of await readdir(full, { withFileTypes: true })) {
      const child = relative === "" ? entry.name : `${relative}/${entry.name}`;

      if (!entry.isDirectory()) {
        empty = false;
        continue;
      }

      // Recurse FIRST: a directory is only empty once its children are gone,
      // which is why this cannot be done top down.
      if (await visit(child)) {
        await rmdir(path.join(root, ...child.split("/")));
        removed.push(child);
      } else {
        empty = false;
      }
    }

    return empty;
  };

  // The root is visited so its children are pruned, but never removed itself.
  await visit("");
  return removed.sort();
}
