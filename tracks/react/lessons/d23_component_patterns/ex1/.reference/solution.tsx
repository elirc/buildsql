// d23_component_patterns / ex1 - reference solution.
import type { ReactNode } from "react";

export function Callout({
  tone,
  title,
  children,
}: {
  tone: "info" | "danger";
  title: string;
  children?: ReactNode;
}) {
  return (
    <div role={tone === "danger" ? "alert" : "status"}>
      {/* A slot, because a title is one specific thing in one specific place */}
      <h3>{title}</h3>
      {/* and children, because the body is whatever the caller needs it to be */}
      {children}
    </div>
  );
}
