// d01_esm_cjs / ex8 - reference solution (author only, used by `dojo verify`).

export type ExportsField = string | Record<string, string | null>;

export function resolveExports(
  field: ExportsField,
  subpath: string,
): string | null {
  // The string shorthand publishes exactly one thing: the main entry.
  if (typeof field === "string") {
    return subpath === "." ? field : null;
  }

  // An exact key always wins, including when its target is null.
  if (Object.prototype.hasOwnProperty.call(field, subpath)) {
    return field[subpath];
  }

  let bestPrefix: string | null = null;
  let bestTarget: string | null = null;
  let captured = "";

  for (const [pattern, target] of Object.entries(field)) {
    const star = pattern.indexOf("*");
    if (star === -1) continue;

    const prefix = pattern.slice(0, star);
    const suffix = pattern.slice(star + 1);
    if (subpath.length < prefix.length + suffix.length) continue;
    if (!subpath.startsWith(prefix) || !subpath.endsWith(suffix)) continue;
    if (bestPrefix !== null && prefix.length <= bestPrefix.length) continue;

    bestPrefix = prefix;
    bestTarget = target;
    captured = subpath.slice(prefix.length, subpath.length - suffix.length);
  }

  if (bestPrefix === null || bestTarget === null) return null;
  return bestTarget.replace("*", captured);
}
