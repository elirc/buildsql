// d16_context / ex1 - reference solution.
import { createContext, useContext, type ReactNode } from "react";

// Created once, at module scope. A context created inside a component would be
// a different channel on every render, and no consumer would ever match it.
const UnitsContext = createContext("unset");

export function UnitsProvider({ units, children }: { units: string; children: ReactNode }) {
  return <UnitsContext.Provider value={units}>{children}</UnitsContext.Provider>;
}

export function UnitsLabel() {
  const units = useContext(UnitsContext);
  return <p role="status">Units: {units}</p>;
}
