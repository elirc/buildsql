// 09_context_reducer / ex2 - reference solution.
import { createContext, useContext } from "react";
import type { ReactNode } from "react";

const SettingsContext = createContext<string | null>(null);

export function SettingsProvider({
  density,
  children,
}: {
  density: string;
  children: ReactNode;
}) {
  return <SettingsContext.Provider value={density}>{children}</SettingsContext.Provider>;
}

export function useSettings(): string {
  const value = useContext(SettingsContext);
  if (value === null) {
    throw new Error("useSettings must be used inside a SettingsProvider");
  }
  return value;
}

export function Density() {
  const density = useSettings();
  return <p role="status">Density: {density}</p>;
}
