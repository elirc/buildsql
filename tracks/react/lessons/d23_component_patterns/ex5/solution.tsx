// d23_component_patterns / ex5 - ids that two fields have to share.
// See tracks/react/lessons/d23_component_patterns/README.md, "Exercise 5".
import type { ReactNode } from "react";

export type HintedFieldParts = { id: string; describedBy: string | undefined };

export function HintedField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: (parts: HintedFieldParts) => ReactNode;
}) {
  const id = "field";
  const hintId = "field-hint";

  return (
    <p>
      <label htmlFor={id}>{label}</label>
      {children({ id, describedBy: hintId })}
      {hint !== undefined && <span id={hintId}>{hint}</span>}
    </p>
  );
}
