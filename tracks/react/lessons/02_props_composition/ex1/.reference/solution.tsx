// 02_props_composition / ex1 - reference solution.
import type { ReactNode } from "react";

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article>
      <h3>{title}</h3>
      {children}
    </article>
  );
}
