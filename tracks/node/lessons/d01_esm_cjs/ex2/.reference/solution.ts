// d01_esm_cjs / ex2 - reference solution (author only, used by `dojo verify`).
import { pathToFileURL } from "node:url";

export function specifierFor(absolutePath: string): string {
  return pathToFileURL(absolutePath).href;
}
