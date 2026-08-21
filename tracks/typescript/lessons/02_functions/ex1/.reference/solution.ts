// 02_functions / ex1 - reference solution (author only).

export function progressLine(done: number, total = 12): string {
  const percent = Math.round((done / total) * 100);
  return `${done}/${total} (${percent}%)`;
}
