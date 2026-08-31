// d12_fs_ops / ex5 - an append-only log.
// See lessons/d12_fs_ops/README.md, "Problem 5".

/** Append one compact JSON record and a newline, creating parents as needed. */
export async function appendJsonl(file: string, record: unknown): Promise<void> {
  throw new Error("ex5: appendJsonl() is not implemented yet - edit this file.");
}

/**
 * Read the records back. A file that does not exist is an empty log; blank
 * lines are skipped; a line that will not parse rejects with
 * `invalid JSON on line <n>`, counting every line from one.
 */
export async function readJsonl<T>(file: string): Promise<T[]> {
  throw new Error("ex5: readJsonl() is not implemented yet - edit this file.");
}
