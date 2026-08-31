// d08_literals_const_enums / ex2 - derive the type from the list.
// See lessons/d08_literals_const_enums/README.md, "ex2".
//
// Without `as const` this array is string[], and everything derived from it is
// `string`. Two things to fix before any logic.

export const SHORTCUTS = ["copy", "paste", "undo"];

export type Shortcut = string;

export function isShortcut(value: string): value is Shortcut {
  throw new Error("ex2: isShortcut() is not implemented yet - edit this file.");
}

export function shortcutIndex(shortcut: Shortcut): number {
  throw new Error("ex2: shortcutIndex() is not implemented yet - edit this file.");
}
