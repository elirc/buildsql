// d13_path_portability / ex1 - reference solution (author only, used by `dojo verify`).
import path from "node:path";

export function relativeUrlPath(fromDir: string, toFile: string): string {
  const relative = path.relative(fromDir, toFile);
  // path.relative() answers in the platform separator; a URL only ever uses /.
  return relative === "" ? "." : relative.split(path.sep).join("/");
}
