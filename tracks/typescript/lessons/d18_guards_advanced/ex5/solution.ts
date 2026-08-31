// d18_guards_advanced / ex5 - filter a discriminated union.
// See lessons/d18_guards_advanced/README.md, "ex5".
//
// The stub returns Task[], which is what filter gives you if you
// do not tell the compiler what the filter proved.

export type Task =
  | { kind: "email"; to: string }
  | { kind: "sms"; number: string }
  | { kind: "push"; token: string };

export function onlyKind<K extends Task["kind"]>(tasks: readonly Task[], kind: K): Task[] {
  throw new Error("ex5: onlyKind() is not implemented yet - edit this file.");
}
