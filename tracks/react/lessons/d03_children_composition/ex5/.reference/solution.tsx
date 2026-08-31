// d03_children_composition / ex5 - reference solution.
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
      {tone === "danger" ? <span> (cannot be undone)</span> : null}
    </button>
  );
}

export function DangerButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <Button tone="danger" onClick={onClick}>
      {children}
    </Button>
  );
}
