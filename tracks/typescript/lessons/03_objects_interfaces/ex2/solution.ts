// 03_objects_interfaces / ex2 - readonly properties and copy-on-write.
// See lessons/03_objects_interfaces/README.md, "Exercise 2".
//
// Nothing here is readonly yet, and renameDraft() does not exist.

export interface Draft {
  id: string;
  title: string;
  tags: string[];
}

export function renameDraft(draft: Draft, title: string): Draft {
  throw new Error("ex2: renameDraft() is not implemented yet - edit this file.");
}
