// d01_esm_cjs / ex7 - reference solution (author only, used by `dojo verify`).
import { stat } from "node:fs/promises";
import path from "node:path";

const EXTENSIONS = [".js", ".json", ".cjs"];
const INDEX_FILES = ["index.js", "index.json"];

async function isFile(candidate: string): Promise<boolean> {
  try {
    return (await stat(candidate)).isFile();
  } catch {
    // ENOENT and ENOTDIR both mean "not a candidate"; anything else would too.
    return false;
  }
}

export async function resolveSpecifier(
  dir: string,
  specifier: string,
): Promise<string | null> {
  const base = path.resolve(dir, specifier);

  if (await isFile(base)) return base;
  for (const extension of EXTENSIONS) {
    const candidate = base + extension;
    if (await isFile(candidate)) return candidate;
  }
  for (const name of INDEX_FILES) {
    const candidate = path.join(base, name);
    if (await isFile(candidate)) return candidate;
  }
  return null;
}
