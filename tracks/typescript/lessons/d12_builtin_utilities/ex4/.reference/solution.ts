// d12_builtin_utilities / ex4 - reference solution (author only).

export const loadPosting = (id: string, includeDrafts: boolean) => ({
  id,
  title: `posting ${id}`,
  draft: includeDrafts,
});

export type LoadArgs = Parameters<typeof loadPosting>;

export type Loaded = ReturnType<typeof loadPosting>;

export function callWith(args: LoadArgs): Loaded {
  return loadPosting(...args);
}
