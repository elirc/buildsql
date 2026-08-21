// 01_modules / ex4 - reference solution (author only, used by `dojo verify`).
import type { Formatter } from "./formatters/registry";

export type FormatterKind = "json" | "csv";

export async function loadFormatter(kind: FormatterKind): Promise<Formatter> {
  switch (kind) {
    case "json": {
      const module = await import("./formatters/json");
      return module.default;
    }
    case "csv": {
      const module = await import("./formatters/csv");
      return module.default;
    }
    default:
      throw new Error(`unknown formatter: ${kind}`);
  }
}
