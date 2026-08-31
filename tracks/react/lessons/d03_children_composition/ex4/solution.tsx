// d03_children_composition / ex4 - three slots, three landmarks.
// See tracks/react/lessons/d03_children_composition/README.md, "Exercise 4".
import type { ReactNode } from "react";

export function PageLayout({
  header,
  sidebar,
  children,
}: {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      {header}
      {sidebar}
      {children}
    </div>
  );
}
