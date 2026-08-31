// d12_fs_ops / ex5 - reference solution (author only, used by `dojo verify`).
import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

export async function appendJsonl(file: string, record: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  // The trailing newline is the format: it is what makes the next append a
  // new record rather than a continuation of this one.
  await appendFile(file, `${JSON.stringify(record)}\n`, "utf8");
}

export async function readJsonl<T>(file: string): Promise<T[]> {
  let raw: string;
  try {
    raw = await readFile(file, "utf8");
  } catch (error) {
    // ENOENT is the ONE failure that means "nothing has happened yet". Every
    // other one - a permissions problem, a directory where a file should be -
    // is real damage and must not be hidden behind an empty array.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const records: T[] = [];
  const lines = raw.split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === "") continue;
    try {
      records.push(JSON.parse(line) as T);
    } catch {
      // The line number, counted over EVERY line including the blank ones, is
      // the only thing that makes a four-million-line log debuggable.
      throw new Error(`invalid JSON on line ${index + 1}`);
    }
  }

  return records;
}
