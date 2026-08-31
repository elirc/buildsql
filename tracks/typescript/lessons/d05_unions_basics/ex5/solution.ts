// d05_unions_basics / ex5 - two members that render the same way.
// See lessons/d05_unions_basics/README.md, "ex5".
//
// Id below has a member this importer does not have.

export type Id = string | number | boolean;

export function idKey(id: Id): string {
  throw new Error("ex5: idKey() is not implemented yet - edit this file.");
}

export function sameId(a: Id, b: Id): boolean {
  throw new Error("ex5: sameId() is not implemented yet - edit this file.");
}
