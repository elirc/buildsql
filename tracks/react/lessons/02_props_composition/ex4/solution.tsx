// 02_props_composition / ex4 - taking two props and forwarding all the rest.
// See tracks/react/lessons/02_props_composition/README.md, "Exercise 4".
import type { ComponentProps } from "react";

type TextFieldProps = { label: string; id: string } & ComponentProps<"input">;

export function TextField({ label, id }: TextFieldProps) {
  return <input id={id} />;
}
