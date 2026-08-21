// i2_interview_drills / ex5 - "flatten this comment tree" (10 minutes).
// See lessons/i2_interview_drills/README.md, "Drill 5".

export interface TreeNode {
  id: string;
  children?: TreeNode[];
}

export interface FlatNode {
  id: string;
  depth: number;
}

export function flattenTree(roots: readonly TreeNode[]): FlatNode[] {
  throw new Error("ex5: flattenTree() is not implemented yet - edit this file.");
}
