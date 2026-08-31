// d13_path_portability / ex2 - reference solution (author only, used by `dojo verify`).
import path from "node:path";

export function changeExtension(file: string, ext: string): string {
  const parsed = path.parse(file);
  const wanted = ext === "" || ext.startsWith(".") ? ext : `.${ext}`;
  // path.format() prefers `base` over `name` + `ext`, so the parsed object is
  // taken apart rather than spread - spreading it would ignore the new ext.
  return path.format({ dir: parsed.dir, name: parsed.name, ext: wanted });
}
