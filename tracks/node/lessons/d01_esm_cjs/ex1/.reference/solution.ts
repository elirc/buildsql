// d01_esm_cjs / ex1 - reference solution (author only, used by `dojo verify`).
import path from "node:path";
import { fileURLToPath } from "node:url";

export function resolveSibling(metaUrl: string, ...segments: string[]): string {
  const dir = path.dirname(fileURLToPath(metaUrl));
  return segments.length === 0 ? dir : path.join(dir, ...segments);
}
