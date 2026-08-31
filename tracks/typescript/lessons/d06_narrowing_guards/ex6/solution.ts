// d06_narrowing_guards / ex6 - the guard that makes filter() narrow.
// See lessons/d06_narrowing_guards/README.md, "ex6".

export interface Tag {
  name: string;
  weight: number;
}

export function isTag(value: unknown): boolean {
  throw new Error("ex6: isTag() is not implemented yet - edit this file.");
}

export function collectTags(values: readonly unknown[]): Tag[] {
  throw new Error("ex6: collectTags() is not implemented yet - edit this file.");
}
