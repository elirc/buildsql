// d13_path_portability / ex6 - reference solution (author only, used by `dojo verify`).
import path from "node:path";

export interface OutputOptions {
  srcRoot: string;
  outRoot: string;
  ext?: string;
}

export function outputPathFor(file: string, options: OutputOptions): string | null {
  const from = path.resolve(options.srcRoot);
  const target = path.resolve(file);

  const relative = path.relative(from, target);
  // "" is the root itself, which is a directory and not an input file.
  if (relative === "") return null;
  if (path.isAbsolute(relative) || relative.split(path.sep)[0] === "..") return null;

  const moved = path.join(options.outRoot, relative);
  if (options.ext === undefined) return moved;

  const parsed = path.parse(moved);
  const wanted = options.ext === "" || options.ext.startsWith(".") ? options.ext : `.${options.ext}`;
  return path.format({ dir: parsed.dir, name: parsed.name, ext: wanted });
}
