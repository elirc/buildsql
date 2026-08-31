// d06_narrowing_guards / ex8 - a union that contains itself.
// See lessons/d06_narrowing_guards/README.md, "ex8".
//
// A TextNode can also be a list of TextNodes. Say so.

export type TextNode = string | number;

export function flattenText(node: TextNode): string {
  throw new Error("ex8: flattenText() is not implemented yet - edit this file.");
}
