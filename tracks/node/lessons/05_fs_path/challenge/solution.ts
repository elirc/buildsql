// 05_fs_path / challenge - a small JSON pipeline.
// See lessons/05_fs_path/README.md, "Challenge".

export interface IndexEntry {
  id: string;
  title: string;
}

export async function buildIndex(dir: string): Promise<IndexEntry[]> {
  throw new Error("challenge: buildIndex() is not implemented yet - edit this file.");
}
