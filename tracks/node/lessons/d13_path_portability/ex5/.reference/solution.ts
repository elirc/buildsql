// d13_path_portability / ex5 - reference solution (author only, used by `dojo verify`).
import path from "node:path";

export function resolveDocLink(fromFile: string, link: string): string | null {
  if (link === "" || link.startsWith("#")) return null;
  // "//host/path" is protocol-relative and has to be checked before the scheme.
  if (link.startsWith("//")) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(link)) return null;
  if (link.startsWith("/")) return null;

  const target = link.split("#")[0].split("?")[0];
  if (target === "") return null;

  // A link is percent-encoded; a filename is not.
  const decoded = decodeURIComponent(target);
  // Links are written with forward slashes whatever the platform, so the
  // segments are split here rather than handed to resolve() as one string.
  return path.resolve(path.dirname(fromFile), ...decoded.split("/"));
}
