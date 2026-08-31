// d23_component_patterns / ex6 - a flag the buttons never hear about.
// See tracks/react/lessons/d23_component_patterns/README.md, "Exercise 6".
import type { ReactNode } from "react";

export function Toolbar({
  label,
  disabled = false,
  children,
}: {
  label: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <div role="toolbar" aria-label={label}>
      {children}
    </div>
  );
}

export function ToolbarButton({
  onClick,
  disabled = false,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button type="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
