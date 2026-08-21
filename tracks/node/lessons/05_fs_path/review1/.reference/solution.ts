// 05_fs_path / review1 - reference solution (author only, used by `dojo verify`).
import { readdir } from "node:fs/promises";
import path from "node:path";

export async function ensureUniqueName(dir: string, name: string): Promise<string> {
  const taken = new Set(await readdir(dir));
  if (!taken.has(name)) return name;

  const { name: stem, ext } = path.parse(name);
  for (let suffix = 1; ; suffix += 1) {
    const candidate = `${stem}-${suffix}${ext}`;
    if (!taken.has(candidate)) return candidate;
  }
}
