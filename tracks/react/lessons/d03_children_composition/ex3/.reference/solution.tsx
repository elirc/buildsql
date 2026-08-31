// d03_children_composition / ex3 - reference solution.
import type { ReactNode } from "react";

export function Banner({ tone, children }: { tone: string; children: ReactNode }) {
  return <div role={tone === "urgent" ? "alert" : "status"}>{children}</div>;
}
