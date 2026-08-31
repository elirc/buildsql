// d13_path_portability / ex3 - reference solution (author only, used by `dojo verify`).
import path from "node:path";

export function safeJoin(root: string, ...segments: string[]): string | null {
  const base = path.resolve(root);
  const target = path.resolve(base, path.join(...segments));

  const relative = path.relative(base, target);
  if (relative === "") return target;
  // Segments, not characters: startsWith("..") would also reject a directory
  // that is honestly called "..config".
  if (path.isAbsolute(relative) || relative.split(path.sep)[0] === "..") return null;
  return target;
}
