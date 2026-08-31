// d03_children_composition / ex6 - children can be a function.
// See tracks/react/lessons/d03_children_composition/README.md, "Exercise 6".
import type { ReactNode } from "react";

export type TogglerState = { on: boolean; toggle: () => void };

export function Toggler({ children }: { children: (state: TogglerState) => ReactNode }) {
  return <div>{children({ on: false, toggle: () => {} })}</div>;
}
