// i2_interview_drills / ex5 - reference solution (author only).

export interface TreeNode {
  id: string;
  children?: TreeNode[];
}

export interface FlatNode {
  id: string;
  depth: number;
}

export function flattenTree(roots: readonly TreeNode[]): FlatNode[] {
  const flat: FlatNode[] = [];
  const walk = (nodes: readonly TreeNode[], depth: number): void => {
    for (const node of nodes) {
      flat.push({ id: node.id, depth });
      walk(node.children ?? [], depth + 1);
    }
  };
  walk(roots, 0);
  return flat;
}
