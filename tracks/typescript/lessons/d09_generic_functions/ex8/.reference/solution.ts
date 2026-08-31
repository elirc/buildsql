// d09_generic_functions / ex8 - reference solution (author only).

export interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

export function buildForest<T>(
  items: readonly T[],
  idOf: (item: T) => string,
  parentOf: (item: T) => string | null,
): TreeNode<T>[] {
  const nodes = new Map<string, TreeNode<T>>();
  for (const item of items) {
    nodes.set(idOf(item), { value: item, children: [] });
  }

  const roots: TreeNode<T>[] = [];
  for (const item of items) {
    const node = nodes.get(idOf(item));
    if (node === undefined) {
      continue;
    }
    const parentId = parentOf(item);
    const parent = parentId === null ? undefined : nodes.get(parentId);
    if (parent === undefined) {
      roots.push(node);
    } else {
      parent.children.push(node);
    }
  }
  return roots;
}
