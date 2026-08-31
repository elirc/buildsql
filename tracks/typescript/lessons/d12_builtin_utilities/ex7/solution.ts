// d12_builtin_utilities / ex7 - ConstructorParameters and InstanceType.
// See lessons/d12_builtin_utilities/README.md, "ex7".
//
// Two aliases to derive from the class, and one method to implement.

export class Search {
  constructor(
    public readonly term: string,
    public readonly limit: number,
  ) {}

  run(postings: readonly string[]): string[] {
    throw new Error("ex7: Search.run() is not implemented yet - edit this file.");
  }
}

export type SearchArgs = unknown[];

export type SearchInstance = object;

export function makeSearch(args: SearchArgs): SearchInstance {
  throw new Error("ex7: makeSearch() is not implemented yet - edit this file.");
}
