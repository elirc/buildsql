// 09_context_reducer / ex2 - a context that refuses to be used wrong.
// See tracks/react/lessons/09_context_reducer/README.md, "Exercise 2".
import { createContext, useContext } from "react";
import type { ReactNode } from "react";

const SettingsContext = createContext<string>("comfortable");

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
  return useContext(SettingsContext);
}

export function Density() {
  const density = useSettings();
  return <p role="status">Density: {density}</p>;
}
