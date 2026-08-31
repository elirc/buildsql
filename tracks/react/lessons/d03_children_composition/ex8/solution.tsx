// d03_children_composition / ex8 - a compound component sharing one id.
// See tracks/react/lessons/d03_children_composition/README.md, "Exercise 8".
import type { ComponentPropsWithoutRef, ReactNode } from "react";

function FormFieldRoot({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function Label({ children }: { children: ReactNode }) {
  return <label htmlFor="field-control">{children}</label>;
}

function Control(props: ComponentPropsWithoutRef<"input">) {
  return <input id="field-control" aria-describedby="field-hint" {...props} />;
}

function Hint({ children }: { children: ReactNode }) {
  return <p id="field-hint">{children}</p>;
}

export const FormField = Object.assign(FormFieldRoot, { Label, Control, Hint });
