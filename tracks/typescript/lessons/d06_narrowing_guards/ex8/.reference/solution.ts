// d06_narrowing_guards / ex8 - reference solution (author only).

export type TextNode = string | number | readonly TextNode[];

export function flattenText(node: TextNode): string {
  if (typeof node === "string") {
    return node.trim();
  }
  if (typeof node === "number") {
    return String(node);
  }
  const parts: string[] = [];
  for (const child of node) {
    const text = flattenText(child);
    if (text !== "") {
      parts.push(text);
    }
  }
  return parts.join(" ");
}
