// 09_context_reducer / ex1 - a value that skips the middle of the tree.
// See tracks/react/lessons/09_context_reducer/README.md, "Exercise 1".
import type { ReactNode } from "react";

export function ThemeProvider({ theme, children }: { theme: string; children: ReactNode }) {
  return <>{children}</>;
}

export function ThemedButton() {
  return <button type="button">Theme: light</button>;
}
