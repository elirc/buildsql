// d09_generic_functions / ex8 - a generic tree, built from flat rows.
// See lessons/d09_generic_functions/README.md, "ex8".
//
// The interface is generic. The function has stopped being.

export interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

export function buildForest<T>(
  items: readonly T[],
  idOf: (item: T) => string,
  parentOf: (item: T) => string | null,
): TreeNode<unknown>[] {
  throw new Error("ex8: buildForest() is not implemented yet - edit this file.");
}
