// 02_props_composition / challenge - a named dialog built from composition.
// See tracks/react/lessons/02_props_composition/README.md, "Challenge".
import type { ReactNode } from "react";

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
