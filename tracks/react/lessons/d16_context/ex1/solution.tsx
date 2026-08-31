// d16_context / ex1 - a provider that provides nothing.
// See tracks/react/lessons/d16_context/README.md, "Exercise 1".
import { createContext, useContext, type ReactNode } from "react";

const UnitsContext = createContext("unset");

export function UnitsProvider({ units, children }: { units: string; children: ReactNode }) {
  return <>{children}</>;
}

export function UnitsLabel() {
  const units = useContext(UnitsContext);
  return <p role="status">Units: {units}</p>;
}
