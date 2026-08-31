// d12_builtin_utilities / ex6 - reference solution (author only).

export async function fetchPosting(id: string): Promise<{ id: string; title: string }> {
  return { id, title: `posting ${id}` };
}

export type Fetched = Awaited<ReturnType<typeof fetchPosting>>;

export async function loadAll(ids: readonly string[]): Promise<Fetched[]> {
  return Promise.all(ids.map((id) => fetchPosting(id)));
}
