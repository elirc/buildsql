// d12_builtin_utilities / ex4 - Parameters and ReturnType.
// See lessons/d12_builtin_utilities/README.md, "ex4".
//
// Both aliases have given up. Derive them from the function below.

export const loadPosting = (id: string, includeDrafts: boolean) => ({
  id,
  title: `posting ${id}`,
  draft: includeDrafts,
});

export type LoadArgs = unknown[];

export type Loaded = unknown;

export function callWith(args: LoadArgs): Loaded {
  throw new Error("ex4: callWith() is not implemented yet - edit this file.");
}
