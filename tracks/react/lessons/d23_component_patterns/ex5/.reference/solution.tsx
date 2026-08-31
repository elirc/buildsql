// d23_component_patterns / ex5 - reference solution.
import { useId, type ReactNode } from "react";

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
  // Unique per instance, so two fields on one page cannot steal each other's
  // label - which is exactly what a pair of hard-coded ids does.
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <p>
      <label htmlFor={id}>{label}</label>
      {/* The caller writes the control; the field tells it what to be called.
          A describedBy of undefined means React omits the attribute, which is
          the only correct thing to do when there is no hint to point at. */}
      {children({ id, describedBy: hint === undefined ? undefined : hintId })}
      {hint !== undefined && <span id={hintId}>{hint}</span>}
    </p>
  );
}
