// d08_literals_const_enums / ex2 - reference solution (author only).

export const SHORTCUTS = ["copy", "paste", "undo"] as const;

export type Shortcut = (typeof SHORTCUTS)[number];

export function isShortcut(value: string): value is Shortcut {
  return (SHORTCUTS as readonly string[]).includes(value);
}

export function shortcutIndex(shortcut: Shortcut): number {
  return SHORTCUTS.indexOf(shortcut);
}
