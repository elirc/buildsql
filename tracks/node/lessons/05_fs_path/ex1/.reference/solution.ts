// 05_fs_path / ex1 - reference solution (author only, used by `dojo verify`).
import path from "node:path";

export function reportPath(root: string, slug: string, file: string): string {
  return path.join(root, slug, file);
}

export function splitName(file: string): { name: string; ext: string } {
  const parsed = path.parse(file);
  return { name: parsed.name, ext: parsed.ext };
}

export function isInside(parent: string, child: string): boolean {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}
