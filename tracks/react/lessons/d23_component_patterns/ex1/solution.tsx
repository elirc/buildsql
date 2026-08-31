// d23_component_patterns / ex1 - content that can only ever be a string.
// See tracks/react/lessons/d23_component_patterns/README.md, "Exercise 1".
import type { ReactNode } from "react";

export function Callout({
  tone,
  title,
  text,
  children,
}: {
  tone: "info" | "danger";
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <div role={tone === "danger" ? "alert" : "status"}>
      <p>{text}</p>
    </div>
  );
}
