// d23_component_patterns / ex8 - two halves that were never introduced.
// See tracks/react/lessons/d23_component_patterns/README.md, "Exercise 8".
import { useState, type ReactNode } from "react";

export function Popover({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div data-open={open}>{children}</div>;
}

function Trigger({ children }: { children: ReactNode }) {
  return (
    <button type="button">{children}</button>
  );
}

function Content({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

Popover.Trigger = Trigger;
Popover.Content = Content;
