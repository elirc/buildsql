// d03_children_composition / ex5 - one button, and a specialised version of it.
// See tracks/react/lessons/d03_children_composition/README.md, "Exercise 5".
import type { ReactNode } from "react";

export function Button({
  tone = "default",
  children,
  onClick,
}: {
  tone?: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  );
}

export function DangerButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  );
}
