// 02_functions / review1 - reference solution (author only).

export function padCell(text: string, width = 8, filler = "."): string {
  if (text.length >= width) {
    return text;
  }
  return text + filler.repeat(width - text.length);
}
