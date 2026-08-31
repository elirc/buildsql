// d02_functions_signatures / ex2 - reference solution (author only).

export function joinPath(...segments: string[]): string {
  const cleaned: string[] = [];
  for (const segment of segments) {
    const trimmed = segment.replace(/^\/+/, "").replace(/\/+$/, "");
    if (trimmed !== "") {
      cleaned.push(trimmed);
    }
  }
  return cleaned.join("/");
}
