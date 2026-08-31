// d01_annotations_inference / ex6 - reference solution (author only).

export function parseCsvRow(row: string): [station: string, celsius: number, ok: boolean] {
  const fields = row.split(",").map((field) => field.trim());
  const raw = fields[1] ?? "";
  const celsius = raw !== "" && Number.isFinite(Number(raw)) ? Number(raw) : 0;
  return [fields[0] ?? "", celsius, fields[2] === "true"];
}
