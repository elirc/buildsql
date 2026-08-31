// d12_fs_ops / ex1 - reference solution (author only, used by `dojo verify`).
import { randomUUID } from "node:crypto";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export async function writeTextAtomic(file: string, text: string): Promise<void> {
  const directory = path.dirname(file);
  await mkdir(directory, { recursive: true });

  // Same directory, so the rename stays inside one filesystem - across a mount
  // point rename degrades to copy-and-delete and stops being atomic. Unique
  // name, so two writers cannot steal each other temporary file.
  const temporary = path.join(directory, `.${path.basename(file)}.${randomUUID()}.tmp`);

  try {
    await writeFile(temporary, text, "utf8");
    await rename(temporary, file);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
}
