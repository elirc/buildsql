// 07_streams_2 / challenge - a real pipeline, end to end.
// See lessons/07_streams_2/README.md, "Challenge".
import type { Readable, Writable } from "node:stream";

export interface CsvStats {
  /** Data rows seen, not counting the header. */
  read: number;
  /** Rows that passed the filter and were written out. */
  written: number;
}

export async function processCsv(
  source: Readable,
  sink: Writable,
  options: { minAmount: number },
): Promise<CsvStats> {
  throw new Error("challenge: processCsv() is not implemented yet - edit this file.");
}
