// 05_fs_path / challenge - reference solution (author only, used by `dojo verify`).
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface IndexEntry {
  id: string;
  title: string;
}

async function jsonFiles(dir: string): Promise<string[]> {
  const found: string[] = [];
  const walk = async (current: string): Promise<void> => {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (path.extname(entry.name) === ".json") {
        found.push(path.relative(dir, full).split(path.sep).join("/"));
      }
    }
  };
  await walk(dir);
  return found.sort();
}

export async function buildIndex(dir: string): Promise<IndexEntry[]> {
  const entries: IndexEntry[] = [];

  for (const relative of await jsonFiles(dir)) {
    if (relative === "index.json") continue;
    const text = await readFile(path.join(dir, ...relative.split("/")), "utf8");
    let parsed: IndexEntry;
    try {
      parsed = JSON.parse(text) as IndexEntry;
    } catch (error) {
      throw new Error(`${relative} is not valid JSON`, { cause: error });
    }
    entries.push({ id: parsed.id, title: parsed.title });
  }

  entries.sort((a, b) => a.id.localeCompare(b.id));
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, "index.json"),
    `${JSON.stringify(entries, null, 2)}\n`,
    "utf8",
  );
  return entries;
}
