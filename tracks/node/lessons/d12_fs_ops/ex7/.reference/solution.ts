// d12_fs_ops / ex7 - reference solution (author only, used by `dojo verify`).
import { copyFile, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

export interface SyncReport {
  copied: string[];
  updated: string[];
  deleted: string[];
}

/** relative path (forward slashes) -> size in bytes, for every file below root. */
async function index(root: string): Promise<Map<string, number>> {
  const found = new Map<string, number>();

  const walk = async (relative: string): Promise<void> => {
    const full = relative === "" ? root : path.join(root, ...relative.split("/"));

    let entries;
    try {
      entries = await readdir(full, { withFileTypes: true });
    } catch (error) {
      // A destination that does not exist yet is an empty destination.
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw error;
    }

    for (const entry of entries) {
      const child = relative === "" ? entry.name : `${relative}/${entry.name}`;
      if (entry.isDirectory()) await walk(child);
      else if (entry.isFile()) {
        found.set(child, (await stat(path.join(full, entry.name))).size);
      }
    }
  };

  await walk("");
  return found;
}

export async function syncDirectories(src: string, dest: string): Promise<SyncReport> {
  // Both sides are indexed BEFORE anything is written, so the comparison is
  // made against a consistent picture rather than against a directory the
  // loop is halfway through modifying.
  const sources = await index(src);
  const targets = await index(dest);

  const copied: string[] = [];
  const updated: string[] = [];
  const deleted: string[] = [];

  for (const [relative, size] of sources) {
    const from = path.join(src, ...relative.split("/"));
    const to = path.join(dest, ...relative.split("/"));
    const existing = targets.get(relative);

    if (existing === undefined) {
      await mkdir(path.dirname(to), { recursive: true });
      await copyFile(from, to);
      copied.push(relative);
    } else if (existing !== size) {
      await copyFile(from, to);
      updated.push(relative);
    }
  }

  for (const relative of targets.keys()) {
    if (sources.has(relative)) continue;
    await rm(path.join(dest, ...relative.split("/")), { force: true });
    deleted.push(relative);
  }

  return { copied: copied.sort(), updated: updated.sort(), deleted: deleted.sort() };
}
