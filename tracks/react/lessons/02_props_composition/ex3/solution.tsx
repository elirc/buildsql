// 02_props_composition / ex3 - JSX passed in as ordinary props (slots).
// See tracks/react/lessons/02_props_composition/README.md, "Exercise 3".
import type { ReactNode } from "react";

export function Panel({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  return <section>{children}</section>;
}
