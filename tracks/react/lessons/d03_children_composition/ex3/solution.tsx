// d03_children_composition / ex3 - the tone decides how loudly this is announced.
// See tracks/react/lessons/d03_children_composition/README.md, "Exercise 3".
import type { ReactNode } from "react";

export function Banner({ tone, children }: { tone: string; children: ReactNode }) {
  return <div role="alert">{children}</div>;
}
