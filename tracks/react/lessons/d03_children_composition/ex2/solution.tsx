// d03_children_composition / ex2 - a label that really labels its children.
// See tracks/react/lessons/d03_children_composition/README.md, "Exercise 2".
import type { ReactNode } from "react";

export function FieldWrapper({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span>{label}</span>
      {children}
    </div>
  );
}
