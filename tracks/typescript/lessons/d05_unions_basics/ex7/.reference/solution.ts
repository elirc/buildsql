// d05_unions_basics / ex7 - reference solution (author only).

export type Cell = string | number | boolean | null;

export function parseCells(row: string): Cell[] {
  return row.split(",").map((field) => {
    const text = field.trim();
    if (text === "") {
      return null;
    }
    if (text === "true") {
      return true;
    }
    if (text === "false") {
      return false;
    }
    const asNumber = Number(text);
    return Number.isFinite(asNumber) ? asNumber : text;
  });
}
