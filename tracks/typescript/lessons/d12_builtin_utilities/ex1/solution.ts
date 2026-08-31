// d12_builtin_utilities / ex1 - Required<T>.
// See lessons/d12_builtin_utilities/README.md, "ex1".
//
// Returning JobDraft promises nothing: every member is still optional.

export interface JobDraft {
  title?: string;
  salary?: number;
  remote?: boolean;
}

export function complete(draft: JobDraft): JobDraft {
  throw new Error("ex1: complete() is not implemented yet - edit this file.");
}
