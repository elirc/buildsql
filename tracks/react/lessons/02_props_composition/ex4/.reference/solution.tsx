// 02_props_composition / ex4 - reference solution.
import type { ComponentProps } from "react";

type TextFieldProps = { label: string; id: string } & ComponentProps<"input">;

export function TextField({ label, id, ...rest }: TextFieldProps) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...rest} />
    </>
  );
}
