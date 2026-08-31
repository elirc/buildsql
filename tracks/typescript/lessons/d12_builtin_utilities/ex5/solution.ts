// d12_builtin_utilities / ex5 - Partial<T>.
// See lessons/d12_builtin_utilities/README.md, "ex5".
//
// A patch is not a whole posting.

export interface Posting {
  id: string;
  title: string;
  salary: number;
  remote: boolean;
}

export function diffPatch(before: Posting, after: Posting): Posting {
  throw new Error("ex5: diffPatch() is not implemented yet - edit this file.");
}
