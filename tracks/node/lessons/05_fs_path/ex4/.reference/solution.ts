// 05_fs_path / ex4 - reference solution (author only, used by `dojo verify`).
import { readFile } from "node:fs/promises";

export async function readJsonOr<T>(file: string, fallback: T): Promise<T> {
  let text: string;
  try {
    text = await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
  return JSON.parse(text) as T;
}
