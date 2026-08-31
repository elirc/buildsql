// d02_functions_signatures / ex1 - reference solution (author only).

export function shelfLabel(title: string, author?: string): string {
  const trimmed = (author ?? "").trim();
  return trimmed === "" ? title : `${title} - ${trimmed}`;
}
