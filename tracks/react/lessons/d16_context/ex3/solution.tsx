// d16_context / ex3 - context is not a global variable.
// See tracks/react/lessons/d16_context/README.md, "Exercise 3".
import type { ReactNode } from "react";

// One value at a time, for the whole module - which is the bug.
let currentZone = "unset";

export function ZoneProvider({ zone, children }: { zone: string; children: ReactNode }) {
  currentZone = zone;
  return <>{children}</>;
}

export function ZoneBadge() {
  return <p role="status">Zone: {currentZone}</p>;
}
