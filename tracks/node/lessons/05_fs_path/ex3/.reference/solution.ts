// 05_fs_path / ex3 - reference solution (author only, used by `dojo verify`).
import { readdir } from "node:fs/promises";
import path from "node:path";

export async function listJsonFiles(dir: string): Promise<string[]> {
  const found: string[] = [];

  const walk = async (current: string): Promise<void> => {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (path.extname(entry.name) === ".json") {
        found.push(path.relative(dir, full).split(path.sep).join("/"));
      }
    }
  };

  await walk(dir);
  return found.sort();
}
