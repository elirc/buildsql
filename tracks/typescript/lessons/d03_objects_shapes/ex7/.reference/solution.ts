// d03_objects_shapes / ex7 - reference solution (author only).

export interface MetaTree {
  [key: string]: string | MetaTree;
}

export function flattenMeta(tree: MetaTree): Record<string, string> {
  const flat: Record<string, string> = {};
  const walk = (node: MetaTree, prefix: string): void => {
    for (const [key, value] of Object.entries(node)) {
      const path = prefix === "" ? key : `${prefix}.${key}`;
      if (typeof value === "string") {
        flat[path] = value;
      } else {
        walk(value, path);
      }
    }
  };
  walk(tree, "");
  return flat;
}
