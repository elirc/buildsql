// d03_children_composition / ex7 - reading the children you were given.
// See tracks/react/lessons/d03_children_composition/README.md, "Exercise 7".
import type { ReactNode } from "react";

export function Case({ when, children }: { when: string; children: ReactNode }) {
  return <>{children}</>;
}

export function Switcher({
  value,
  fallback,
  children,
}: {
  value: string;
  fallback: ReactNode;
  children: ReactNode;
}) {
  return <>{children}</>;
}
