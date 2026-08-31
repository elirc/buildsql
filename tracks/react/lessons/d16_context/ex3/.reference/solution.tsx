// d16_context / ex3 - reference solution.
import { createContext, useContext, type ReactNode } from "react";

const ZoneContext = createContext("unset");

export function ZoneProvider({ zone, children }: { zone: string; children: ReactNode }) {
  return <ZoneContext.Provider value={zone}>{children}</ZoneContext.Provider>;
}

export function ZoneBadge() {
  // Reads the nearest provider above *this* element in the tree, which is what
  // makes nesting an override rather than an assignment.
  const zone = useContext(ZoneContext);
  return <p role="status">Zone: {zone}</p>;
}
