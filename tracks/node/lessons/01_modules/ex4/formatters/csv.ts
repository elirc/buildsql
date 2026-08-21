// Shipped with the lesson - do not edit.
import { markLoaded, type Formatter } from "./registry";

markLoaded("csv");

const format: Formatter = (rows) => {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => String(row[header])).join(","));
  }
  return lines.join("\n");
};

export default format;
