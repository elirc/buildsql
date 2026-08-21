// 01_modules / ex4 - load the module you need, when you need it.
// See lessons/01_modules/README.md, "Exercise 4".
//
// The two formatter modules live in ./formatters/json.ts and
// ./formatters/csv.ts. Each one default-exports a Formatter.
import type { Formatter } from "./formatters/registry";

export type FormatterKind = "json" | "csv";

export async function loadFormatter(kind: FormatterKind): Promise<Formatter> {
  throw new Error("ex4: loadFormatter() is not implemented yet - edit this file.");
}
