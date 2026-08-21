// 09_context_reducer / ex1 - reference solution.
import { createContext, useContext } from "react";
import type { ReactNode } from "react";

const ThemeContext = createContext("light");

export function ThemeProvider({ theme, children }: { theme: string; children: ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button type="button">Theme: {theme}</button>;
}
