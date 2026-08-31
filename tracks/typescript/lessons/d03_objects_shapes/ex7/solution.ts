// d03_objects_shapes / ex7 - a recursive index signature.
// See lessons/d03_objects_shapes/README.md, "ex7".
//
// A MetaTree value is either a string leaf or another MetaTree. Say so.

export interface MetaTree {
  [key: string]: unknown;
}

export function flattenMeta(tree: MetaTree): Record<string, string> {
  throw new Error("ex7: flattenMeta() is not implemented yet - edit this file.");
}
