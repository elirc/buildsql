// d12_fs_ops / ex8 - reference solution (author only, used by `dojo verify`).
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

export async function findDuplicates(dir: string): Promise<string[][]> {
  const byDigest = new Map<string, string[]>();

  const walk = async (relative: string): Promise<void> => {
    const full = relative === "" ? dir : path.join(dir, ...relative.split("/"));

    for (const entry of await readdir(full, { withFileTypes: true })) {
      const child = relative === "" ? entry.name : `${relative}/${entry.name}`;

      if (entry.isDirectory()) {
        await walk(child);
        continue;
      }
      if (!entry.isFile()) continue;

      // The digest, not the contents, is the map key: a hash is a fixed 64
      // characters however big the file is.
      const contents = await readFile(path.join(full, entry.name));
      const digest = createHash("sha256").update(contents).digest("hex");

      const group = byDigest.get(digest) ?? [];
      group.push(child);
      byDigest.set(digest, group);
    }
  };

  await walk("");

  return [...byDigest.values()]
    .filter((group) => group.length > 1)
    .map((group) => [...group].sort())
    .sort((left, right) => (left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0));
}
