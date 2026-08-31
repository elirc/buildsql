// d12_builtin_utilities / ex6 - Awaited<T>.
// See lessons/d12_builtin_utilities/README.md, "ex6".
//
// Fetched still has a Promise inside it, so Fetched[] is an array of promises.

export async function fetchPosting(id: string): Promise<{ id: string; title: string }> {
  return { id, title: `posting ${id}` };
}

export type Fetched = ReturnType<typeof fetchPosting>;

export async function loadAll(ids: readonly string[]): Promise<Fetched[]> {
  throw new Error("ex6: loadAll() is not implemented yet - edit this file.");
}
