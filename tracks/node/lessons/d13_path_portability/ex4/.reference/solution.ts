// d13_path_portability / ex4 - reference solution (author only, used by `dojo verify`).
import path from "node:path";

export function commonAncestor(paths: string[]): string | null {
  if (paths.length === 0) return null;

  const split = paths.map((entry) => path.resolve(entry).split(path.sep));
  let common = split[0];

  for (const parts of split.slice(1)) {
    let i = 0;
    while (i < common.length && i < parts.length && common[i] === parts[i]) i += 1;
    common = common.slice(0, i);
  }

  // Nothing shared at all: different drives on Windows, and nothing on POSIX.
  if (common.length === 0) return null;
  // ["", "var"] joins to "/var"; ["", ""] would join to "" and means the root.
  return common.join(path.sep) || path.sep;
}
