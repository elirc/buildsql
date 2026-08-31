// d12_builtin_utilities / ex7 - reference solution (author only).

export class Search {
  constructor(
    public readonly term: string,
    public readonly limit: number,
  ) {}

  run(postings: readonly string[]): string[] {
    const needle = this.term.toLowerCase();
    return postings
      .filter((posting) => posting.toLowerCase().includes(needle))
      .slice(0, this.limit);
  }
}

export type SearchArgs = ConstructorParameters<typeof Search>;

export type SearchInstance = InstanceType<typeof Search>;

export function makeSearch(args: SearchArgs): SearchInstance {
  return new Search(...args);
}
