// d22_declaration_files / ex1 - a function with members.
// See lessons/d22_declaration_files/README.md, "ex1".
//
// The stub is a bare function, so parseTag.VERSION does not
// exist - not at runtime and not in the type.

export interface Tag {
  scope: string;
  name: string;
}

export function parseTag(raw: string): Tag {
  throw new Error("ex1: parseTag() is not implemented yet - edit this file.");
}
