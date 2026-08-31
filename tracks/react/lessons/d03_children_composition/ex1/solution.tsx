// d03_children_composition / ex1 - a heading, then whatever you were given.
// See tracks/react/lessons/d03_children_composition/README.md, "Exercise 1".
import type { ReactNode } from "react";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return <div>{children}</div>;
}
