// d03_children_composition / ex2 - reference solution.
import type { ReactNode } from "react";

export function FieldWrapper({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <span>{label}</span>
      {children}
    </label>
  );
}
